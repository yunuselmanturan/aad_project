import { environment } from './../../../environments/environment';
// front_end/src/app/core/services/payment/stripe.service.ts
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripePromise = loadStripe(environment.stripePublishableKey);

  constructor(private http: HttpClient) {}

  async pay(orderId: number, amountCents: number) {
    const stripe = await this.stripePromise as Stripe;
    const response = await firstValueFrom(
      this.http.post<{ clientSecret: string }>(
        `${environment.apiUrl}/payment/create-payment-intent`,
        { orderId, amount: amountCents, currency: 'usd' }
      )
    );
    if (!response) {
      throw new Error('Failed to create payment intent');
    }

    const { clientSecret } = response;

    // show Stripe’s card element or Payment Sheet
    const { error } = await stripe.confirmPayment({
      elements: stripe.elements({ clientSecret }),
      confirmParams: { return_url: window.location.origin + '/order-success' },
    });
    if (error) { throw error; }
  }
}
