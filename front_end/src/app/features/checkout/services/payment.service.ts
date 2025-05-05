import { environment } from './../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PaymentIntentResponse {
  clientSecret: string;
  orderId: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payment`;

  constructor(private http: HttpClient) {}

  createPaymentIntent(orderId: number): Observable<PaymentIntentResponse> {
    return this.http.post<ApiResponse<PaymentIntentResponse>>(
      `${this.apiUrl}/create-payment-intent`,
      { orderId }
    ).pipe(
      map(response => response.data)
    );
  }

  confirmPayment(orderId: number, paymentIntentId: string): Observable<{ status: string }> {
    return this.http.post<ApiResponse<{ status: string }>>(
      `${this.apiUrl}/confirm/${orderId}`,
      { paymentIntentId }
    ).pipe(
      map(response => response.data)
    );
  }
}
