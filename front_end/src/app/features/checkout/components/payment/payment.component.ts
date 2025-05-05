// features/checkout/components/payment/payment.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { PaymentMethod } from '../../../auth/components/user-profile/user-profile.component';
import { OrderService, Order } from '../../services/order.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.component.html'
})
export class PaymentComponent implements OnInit {
  orderId: number | null = null;
  orderDetails: Order | null = null;
  paymentForm!: FormGroup;
  error: string | null = null;
  processing: boolean = false;
  clientSecret: string | null = null;

  savedPaymentMethods: PaymentMethod[] = [];
  useExistingPayment: boolean = true;
  showPaymentForm: boolean = false;

  get isLoggedIn(): boolean {
    return !!this.authService.currentUserSubject.value;
  }

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private orderService: OrderService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadOrderAndCreatePaymentIntent();
  }

  private initializeForm(): void {
    this.paymentForm = this.fb.group({
      selectedPaymentId: ['', Validators.required],
      newPayment: this.fb.group({
        cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
        cardholderName: ['', Validators.required],
        expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
        expiryYear: ['', [Validators.required, Validators.min(new Date().getFullYear())]],
        cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
        savePayment: [true]
      })
    });
  }

  private loadOrderAndCreatePaymentIntent(): void {
    const idStr = sessionStorage.getItem('currentOrderId');
    if (!idStr) {
      this.router.navigate(['/cart']);
      return;
    }

    this.orderId = Number(idStr);
    this.loadOrderDetails();
  }

  loadOrderDetails(): void {
    if (!this.orderId) return;

    this.orderService.getOrder(this.orderId).subscribe({
      next: (order: Order) => {
        this.orderDetails = order;
        // Create payment intent after loading order
        this.createPaymentIntent();
      },
      error: (err: any) => {
        console.error('Error fetching order details', err);
        this.error = 'Could not load order details.';
      }
    });
  }

  private createPaymentIntent(): void {
    if (!this.orderId) return;

    this.paymentService.createPaymentIntent(this.orderId).subscribe({
      next: (response) => {
        this.clientSecret = response.clientSecret;
      },
      error: (err) => {
        console.error('Error creating payment intent:', err);
        this.error = 'Could not initialize payment. Please try again.';
      }
    });
  }

  loadPaymentMethods(): void {
    // In a real app, this would be an API call
    // For now, we'll mock the data (similar to the profile component)
    this.savedPaymentMethods = [
      {
        id: 1,
        cardNumber: '1234567890123456',
        cardholderName: 'John Doe',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      }
    ];

    // If user has saved payment methods, select the default one
    if (this.savedPaymentMethods.length > 0) {
      const defaultPayment = this.savedPaymentMethods.find(pm => pm.isDefault);
      if (defaultPayment) {
        this.paymentForm.patchValue({
          selectedPaymentId: defaultPayment.id
        });
      } else {
        this.paymentForm.patchValue({
          selectedPaymentId: this.savedPaymentMethods[0].id
        });
      }
    } else {
      // If no saved payment methods, show the payment form
      this.useExistingPayment = false;
      this.showPaymentForm = true;
    }
  }

  togglePaymentForm(): void {
    this.useExistingPayment = !this.useExistingPayment;
    this.showPaymentForm = !this.useExistingPayment;

    if (this.useExistingPayment) {
      // Reset the new payment form when switching back to saved payments
      this.paymentForm.get('newPayment')?.reset();
      this.paymentForm.get('newPayment')?.patchValue({ savePayment: true });
    } else {
      // Reset payment selection when switching to new payment
      this.paymentForm.get('selectedPaymentId')?.reset();
    }
  }

  maskCardNumber(cardNumber: string): string {
    return 'xxxx-xxxx-xxxx-' + cardNumber.slice(-4);
  }

  async pay(): Promise<void> {
    if (!this.orderId || !this.clientSecret || this.paymentForm.invalid) {
      this.error = 'Please fill in all required payment fields correctly.';
      return;
    }

    this.processing = true;
    this.error = null;

    try {
      const result = await this.confirmPayment();
      if (result.status === 'SUCCESS') {
        sessionStorage.removeItem('currentOrderId');
        this.router.navigate(['/checkout/success'], {
          queryParams: { orderId: this.orderId }
        });
      } else {
        this.error = 'Payment failed. Please try again.';
      }
    } catch (err) {
      console.error('Payment error:', err);
      this.error = 'Payment could not be processed.';
    } finally {
      this.processing = false;
    }
  }

  private async confirmPayment(): Promise<{ status: string }> {
    if (!this.orderId || !this.clientSecret) {
      throw new Error('Missing payment information');
    }

    // Here you would typically handle the actual payment confirmation
    return firstValueFrom(this.paymentService.confirmPayment(
      this.orderId,
      this.clientSecret
    ));
  }

  private saveNewPaymentMethod(paymentData: any): void {
    // In a real app, this would be an API call to save the payment method
    console.log('Saving new payment method:', paymentData);
    // Mock implementation - we'd normally send this to the backend
    const newPayment: PaymentMethod = {
      id: Date.now(), // Temporary ID
      cardNumber: paymentData.cardNumber,
      cardholderName: paymentData.cardholderName,
      expiryMonth: paymentData.expiryMonth,
      expiryYear: paymentData.expiryYear,
      isDefault: false
    };

    // Update the local list
    this.savedPaymentMethods.push(newPayment);
  }

  // Helper to safely get order total
  getOrderTotal(): number {
    if (!this.orderDetails) return 0;

    // Try to access various properties where the total might be stored
    // using type assertion to avoid compilation errors
    const details = this.orderDetails as any;
    return details.total || details.subtotal || details.amount || 0;
  }
}
