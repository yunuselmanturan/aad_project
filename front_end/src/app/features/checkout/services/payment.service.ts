import { environment } from './../../../../environments/environment';
// features/checkout/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  processPayment(orderId: number, paymentInfo: any): Observable<{ status: string, receiptUrl?: string }> {
    // Example: call backend to process payment for order (could integrate with Stripe)
    // paymentInfo might contain card details or token; backend would handle securely.
    return this.http.post<{status: string, receiptUrl?: string}>(`${this.apiUrl}/orders/${orderId}/pay`, paymentInfo);
  }
}
