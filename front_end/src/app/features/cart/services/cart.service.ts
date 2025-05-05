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
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    description?: string;
    imageUrls?: string[];
  };
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
    if (!this.isBrowser) return;

    this.http.get<ApiResponse<CartItem[]>>(`${this.apiUrl}`)
      .pipe(
        map(response => {
          console.log('Raw API response:', response); // Debug log

          if (!response?.data) {
            console.warn('No data in response');
            return [];
          }

          // Safely map the data with null checks
          return response.data.map(item => ({
            id: item?.id ?? 0,
            product: {
              id: item?.product?.id ?? 0,
              name: item?.product?.name ?? 'Unknown Product',
              price: item?.product?.price ?? 0,
              imageUrls: [item?.product?.imageUrls?.[0] ?? '']
            },
            quantity: item?.quantity ?? 1
          }));
        })
      )
      .subscribe({
        next: (items) => {
          console.log('Processed cart items:', items); // Debug log
          this.itemsSubject.next(items);
        },
        error: (err) => {
          console.error('Error fetching cart:', err);
          this.notificationService.showError('Failed to load cart items');
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
    if (!this.isBrowser) return;

    if (this.authService.isLoggedIn()) {
      this.http.post<ApiResponse<CartItem>>(`${this.apiUrl}/add`, null, {
        params: { productId: product.id.toString(), quantity: quantity.toString() }
      })
      .pipe(map(response => response.data))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Item added to cart');
          this.fetchCartFromApi();
        },
        error: (err) => {
          console.error('Error adding to cart:', err);
          this.notificationService.showError('Failed to add item to cart');
        }
      });
    } else {
      const items = [...this.itemsSubject.value];
      const idx = items.findIndex(it => it.product.id === product.id);

      if (idx >= 0) {
        items[idx].quantity += quantity;
      } else {
        items.push({
          id: Date.now(), // Temporary ID for local storage
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            imageUrls: product.imageUrls
          },
          quantity
        });
      }

      this.updateLocalCart(items);
      this.notificationService.showSuccess('Item added to cart');
    }
  }

  removeItem(productId: number): void {
    if (!this.isBrowser) return;

    if (this.authService.isLoggedIn()) {
      this.http.delete<ApiResponse<null>>(`${this.apiUrl}/items/${productId}`)
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Item removed from cart');
            this.fetchCartFromApi();
          },
          error: (err) => {
            console.error('Error removing item:', err);
            this.notificationService.showError('Failed to remove item');
          }
        });
    } else {
      let items = this.itemsSubject.value;
      items = items.filter(it => it.product.id !== productId);
      this.updateLocalCart(items);
      this.notificationService.showSuccess('Item removed from cart');
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    if (!this.isBrowser) return;

    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    if (this.authService.isLoggedIn()) {
      this.http.put<ApiResponse<CartItem>>(`${this.apiUrl}/items/${productId}`, { quantity })
        .pipe(map(response => response.data))
        .subscribe({
          next: () => {
            this.fetchCartFromApi();
            this.notificationService.showSuccess('Cart updated');
          },
          error: (err) => {
            console.error('Error updating cart:', err);
            this.notificationService.showError('Failed to update cart');
          }
        });
    } else {
      const items = [...this.itemsSubject.value];
      const idx = items.findIndex(it => it.product.id === productId);
      if (idx >= 0) {
        items[idx].quantity = quantity;
        this.updateLocalCart(items);
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
        const product: Product = {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          imageUrls: item.product.imageUrls || [],
          description: '', // Default description
          stockQuantity: 0, // Default stock quantity
          storeId: 0,       // Default store id
          categoryId: 0     // Default category id
        };
        this.addItem(product, item.quantity);
      });

      // Clear local storage cart after merging
      localStorage.removeItem('cart-items');
    }

    // Fetch the updated cart from server
    this.fetchCartFromApi();
  }
}


