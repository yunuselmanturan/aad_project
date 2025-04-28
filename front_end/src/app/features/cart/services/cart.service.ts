// features/cart/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../../catalogue/services/product.service';

export interface CartItem { product: Product; quantity: number; }

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor() {
    // Load cart from localStorage if available
    const saved = localStorage.getItem('cart-items');
    if (saved) {
      this.itemsSubject.next(JSON.parse(saved));
    }
    // Note: If integrating with backend, here we could fetch initial cart from API for logged-in user
  }

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  addItem(product: Product, quantity: number = 1): void {
    const items = this.itemsSubject.value;
    const idx = items.findIndex(it => it.product.id === product.id);
    if (idx >= 0) {
      // If item already in cart, increase quantity
      items[idx].quantity += quantity;
    } else {
      items.push({ product, quantity });
    }
    this.updateCart(items);
  }

  removeItem(productId: number): void {
    let items = this.itemsSubject.value;
    items = items.filter(it => it.product.id !== productId);
    this.updateCart(items);
  }

  updateQuantity(productId: number, quantity: number): void {
    const items = this.itemsSubject.value;
    const idx = items.findIndex(it => it.product.id === productId);
    if (idx >= 0) {
      if (quantity > 0) {
        items[idx].quantity = quantity;
      } else {
        // remove if quantity set to 0
        items.splice(idx, 1);
      }
      this.updateCart(items);
    }
  }

  clearCart(): void {
    this.updateCart([]);
  }

  private updateCart(items: CartItem[]): void {
    this.itemsSubject.next(items);
    localStorage.setItem('cart-items', JSON.stringify(items));
  }
}
