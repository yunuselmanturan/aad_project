import { environment } from './../../../../environments/environment';
// features/checkout/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from '../../cart/services/cart.service';

export interface Order {
  id: number;
  items: { productId: number, quantity: number, price: number }[];
  totalPrice: number;
  status: string;       // e.g., 'PENDING_PAYMENT', 'PAID', 'SHIPPED', etc.
  shippingAddress: any; // could be an address object with fields
  userId: number;
  orderDate: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  createOrder(shippingInfo: any, cartItems: CartItem[]): Observable<Order> {
    // Transform cart items into the structure expected by backend (productId & quantity)
    const orderItems = cartItems.map(it => ({
      productId: it.product.id,
      quantity: it.quantity,
      price: it.product.price
    }));
    const payload = { shippingAddress: shippingInfo, items: orderItems };
    return this.http.post<Order>(`${this.apiUrl}/orders`, payload);
  }

  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`);
  }

  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
    // Assuming this returns only orders for the current logged-in user
  }
}
