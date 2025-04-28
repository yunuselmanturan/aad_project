// features/checkout/components/order-success/order-success.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: false,
  template: `
    <div class="success">
      <h2>Thank you!</h2>
      <p>Your order has been placed successfully.</p>
      <a routerLink="/orders">View My Orders</a>
    </div>
  `,
  styles: [`
    .success { text-align: center; padding: 2rem; }
    .success h2 { color: #4caf50; }
  `]
})
export class OrderSuccessComponent {
  // In a more advanced version, you might display order details or number here,
  // possibly by retrieving the last order from an OrderService or passing via state.
}
