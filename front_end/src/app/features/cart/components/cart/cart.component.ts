import { NotificationService } from './../../../../core/services/notification.service';
// features/cart/components/cart/cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;

  constructor(private cartService: CartService, private notify: NotificationService, private router: Router) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartService.items$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.product.id);
    this.notify.showSuccess(`${item.product.name} removed from cart.`);
  }

  updateQuantity(item: CartItem, newQty: number): void {
    if (newQty < 1) {
      this.removeItem(item);
    } else {
      this.cartService.updateQuantity(item.product.id, newQty);
    }
  }

  proceedToCheckout(): void {
    if (!this.cartItems.length) return;
    // Navigate to checkout page
    this.router.navigate(['/checkout']);
  }
}
