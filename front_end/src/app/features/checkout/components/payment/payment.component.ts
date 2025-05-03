// features/checkout/components/payment/payment.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { PaymentMethod } from '../../../auth/components/user-profile/user-profile.component';
import { OrderService, Order } from '../../services/order.service';

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
    // Initialize payment form
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

    // Retrieve orderId from session or redirect if not present
    const idStr = sessionStorage.getItem('currentOrderId');
    if (idStr) {
      this.orderId = Number(idStr);
      this.loadOrderDetails();
    } else {
      // If no order id, redirect to cart page
      this.router.navigate(['/cart']);
    }

    // Load user's saved payment methods if logged in
    if (this.isLoggedIn) {
      this.loadPaymentMethods();
    } else {
      // If not logged in, default to new payment method
      this.useExistingPayment = false;
      this.showPaymentForm = true;
    }
  }

  loadOrderDetails(): void {
    if (!this.orderId) return;

    this.orderService.getOrder(this.orderId).subscribe({
      next: (order: Order) => {
        this.orderDetails = order;
      },
      error: (err: any) => {
        console.error('Error fetching order details', err);
        this.error = 'Could not load order details.';
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

  pay(): void {
    if (!this.orderId) return;

    if (this.useExistingPayment && this.paymentForm.get('selectedPaymentId')?.invalid) {
      this.error = 'Please select a payment method.';
      return;
    }

    if (!this.useExistingPayment && this.paymentForm.get('newPayment')?.invalid) {
      this.error = 'Please fill in all required payment fields correctly.';
      return;
    }

    this.processing = true;
    this.error = null;

    let paymentInfo: any;

    if (this.useExistingPayment) {
      const selectedPaymentId = this.paymentForm.value.selectedPaymentId;
      const selectedPayment = this.savedPaymentMethods.find(pm => pm.id === selectedPaymentId);

      if (!selectedPayment) {
        this.error = 'Selected payment method not found.';
        this.processing = false;
        return;
      }

      paymentInfo = {
        paymentMethodId: selectedPayment.id,
        // Include minimal info for existing payment method
        cardNumber: selectedPayment.cardNumber.slice(-4),
        cardholderName: selectedPayment.cardholderName
      };
    } else {
      const newPayment = this.paymentForm.get('newPayment')?.value;
      paymentInfo = {
        cardNumber: newPayment.cardNumber,
        cardholderName: newPayment.cardholderName,
        expiryMonth: newPayment.expiryMonth,
        expiryYear: newPayment.expiryYear,
        cvv: newPayment.cvv
      };

      // If user is logged in and wants to save the payment method, do it
      if (this.isLoggedIn && newPayment.savePayment) {
        this.saveNewPaymentMethod(newPayment);
      }
    }

    // Process the payment
    this.paymentService.processPayment(this.orderId, paymentInfo).subscribe({
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
