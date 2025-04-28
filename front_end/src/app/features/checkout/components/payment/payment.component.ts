// features/checkout/components/payment/payment.component.ts
import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.component.html'
})
export class PaymentComponent implements OnInit {
  orderId: number | null = null;
  paymentInfo: any = { cardNumber: '', expiry: '', cvv: '' };
  error: string | null = null;
  processing: boolean = false;

  constructor(private paymentService: PaymentService, private router: Router) {}

  ngOnInit(): void {
    // Retrieve orderId from session or redirect if not present
    const idStr = sessionStorage.getItem('currentOrderId');
    if (idStr) {
      this.orderId = Number(idStr);
    } else {
      // If no order id, skip to main page (perhaps user refreshed or came here incorrectly)
      this.router.navigate(['/']);
    }
  }

  pay(): void {
    if (!this.orderId) return;
    this.processing = true;
    this.error = null;
    // In a real app, you would get a token from a payment gateway instead of sending raw card details
    this.paymentService.processPayment(this.orderId, this.paymentInfo).subscribe({
      next: res => {
        this.processing = false;
        if (res.status === 'SUCCESS') {
          sessionStorage.removeItem('currentOrderId');
          this.router.navigate(['/checkout/success']);
        } else {
          this.error = 'Payment failed. Please try another method.';
        }
      },
      error: err => {
        console.error('Payment error', err);
        this.processing = false;
        this.error = 'Payment could not be processed.';
      }
    });
  }
}
