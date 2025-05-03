// features/cart/services/cart.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Product } from '../../catalogue/services/product.service';
import { environment } from '../../../../environments/environment.development';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/cart`;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadCart();
  }

  private loadCart(): void {
    if (!this.isBrowser) {
      return; // Don't load cart on server
    }

    if (this.authService.isLoggedIn()) {
      // If logged in, fetch from API
      this.fetchCartFromApi();
    } else {
      // If not logged in, load from local storage
      const saved = localStorage.getItem('cart-items');
      if (saved) {
        this.itemsSubject.next(JSON.parse(saved));
      }
    }
  }

  private fetchCartFromApi(): void {
    if (!this.isBrowser) {
      return; // Skip API call on server
    }

    this.http.get<ApiResponse<CartItem[]>>(this.apiUrl)
      .pipe(map(response => response.data))
      .subscribe({
        next: (items) => {
          this.itemsSubject.next(items);
        },
        error: (err) => {
          console.error('Error fetching cart:', err);
        }
      });
  }

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  getCartCount(): Observable<number> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.apiUrl}/count`)
      .pipe(map(response => response.data.count));
  }

  addItem(product: Product, quantity: number = 1): void {
    if (!this.isBrowser) {
      return; // Skip on server
    }

    if (this.authService.isLoggedIn()) {
      // If logged in, use API
      this.http.post<ApiResponse<CartItem>>(`${this.apiUrl}/add`, null, {
        params: { productId: product.id.toString(), quantity: quantity.toString() }
      })
      .pipe(map(response => response.data))
      .subscribe({
        next: (cartItem) => {
          this.notificationService.showSuccess('Item added to cart');
          this.fetchCartFromApi(); // Refresh the entire cart after adding
        },
        error: (err) => {
          this.notificationService.showError('Failed to add item to cart');
          console.error('Error adding to cart:', err);
        }
      });
    } else {
      // If not logged in, use local storage
      const items = this.itemsSubject.value;
      const idx = items.findIndex(it => it.product.id === product.id);

      if (idx >= 0) {
        // If item already in cart, increase quantity
        items[idx].quantity += quantity;
      } else {
        items.push({ product, quantity });
      }

      this.updateLocalCart(items);
      this.notificationService.showSuccess('Item added to cart');
    }
  }

  removeItem(productId: number): void {
    if (!this.isBrowser) {
      return; // Skip on server
    }

    if (this.authService.isLoggedIn()) {
      // If logged in, use API
      this.http.delete<ApiResponse<null>>(`${this.apiUrl}/items/${productId}`)
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Item removed from cart');
            this.fetchCartFromApi(); // Refresh the cart
          },
          error: (err) => {
            this.notificationService.showError('Failed to remove item from cart');
            console.error('Error removing from cart:', err);
          }
        });
    } else {
      // If not logged in, use local storage
      let items = this.itemsSubject.value;
      items = items.filter(it => it.product.id !== productId);
      this.updateLocalCart(items);
      this.notificationService.showSuccess('Item removed from cart');
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    if (!this.isBrowser) {
      return; // Skip on server
    }

    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    if (this.authService.isLoggedIn()) {
      // For logged-in users, we'll need an endpoint like PUT /api/cart/items/{id}
      // If it doesn't exist yet, we can use addToCart with the updated quantity
      this.http.post<ApiResponse<CartItem>>(`${this.apiUrl}/add`, null, {
        params: { productId: productId.toString(), quantity: quantity.toString() }
      })
      .pipe(map(response => response.data))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Cart updated');
          this.fetchCartFromApi();
        },
        error: (err) => {
          this.notificationService.showError('Failed to update cart');
          console.error('Error updating cart:', err);
        }
      });
    } else {
      // For non-logged in users, update in local storage
      const items = this.itemsSubject.value;
      const idx = items.findIndex(it => it.product.id === productId);

      if (idx >= 0) {
        items[idx].quantity = quantity;
        this.updateLocalCart(items);
        this.notificationService.showSuccess('Cart updated');
      }
    }
  }

  clearCart(): void {
    if (!this.isBrowser) {
      return; // Skip on server
    }

    if (this.authService.isLoggedIn()) {
      // If logged in, use API
      this.http.delete<ApiResponse<null>>(`${this.apiUrl}/clear`)
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Cart cleared');
            this.itemsSubject.next([]);
          },
          error: (err) => {
            this.notificationService.showError('Failed to clear cart');
            console.error('Error clearing cart:', err);
          }
        });
    } else {
      // If not logged in, clear local storage
      this.updateLocalCart([]);
      this.notificationService.showSuccess('Cart cleared');
    }
  }

  private updateLocalCart(items: CartItem[]): void {
    if (!this.isBrowser) {
      return; // Skip on server
    }

    this.itemsSubject.next(items);
    localStorage.setItem('cart-items', JSON.stringify(items));
  }

  // Method to merge local cart with user's server cart on login
  mergeWithServerCart(): void {
    if (!this.isBrowser) {
      return; // Skip on server
    }

    const localCart = JSON.parse(localStorage.getItem('cart-items') || '[]');

    if (localCart.length > 0) {
      // Add each local item to the server cart
      localCart.forEach((item: CartItem) => {
        this.addItem(item.product, item.quantity);
      });

      // Clear local storage cart after merging
      localStorage.removeItem('cart-items');
    }

    // Fetch the updated cart from server
    this.fetchCartFromApi();
  }
}
