import { CartService, CartItem } from './../../../cart/services/cart.service';
// features/checkout/components/checkout/checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../..//services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  submitted: boolean = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private cartService: CartService, private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    // Build form for shipping details
    this.checkoutForm = this.fb.group({
      fullName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required]
    });
    // Get current cart items
    this.cartItems = this.cartService.getItems();
    if (!this.cartItems.length) {
      // If cart empty, redirect to catalogue or prevent access
      this.router.navigate(['/cart']);
    }
  }

  get f() { return this.checkoutForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.checkoutForm.invalid) return;
    const shippingInfo = this.checkoutForm.value;
    // Call OrderService to create order
    this.orderService.createOrder(shippingInfo, this.cartItems).subscribe({
      next: order => {
        // Order created successfully. Now navigate to payment step, perhaps carrying order ID.
        // We can store the order ID (or full order) in session storage or a service for PaymentComponent to access.
        sessionStorage.setItem('currentOrderId', String(order.id));
        this.cartService.clearCart();  // clear cart once order is placed (to avoid re-ordering same items)
        this.router.navigate(['/checkout/payment']);
      },
      error: err => {
        console.error('Order creation failed', err);
        this.error = 'Failed to create order. Please try again.';
      }
    });
  }

  func(): number {
    return this.cartItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
  }
}
