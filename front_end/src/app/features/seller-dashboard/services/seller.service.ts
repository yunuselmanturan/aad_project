import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Product }     from '../../catalogue/services/product.service';
import { Order }       from '../../checkout/services/order.service';

export interface Store {
  id: number;
  name: string;
  description: string;
  sellerId: number;
}

@Injectable({ providedIn: 'root' })
export class SellerService {

  private apiUrl = environment.apiUrl;            // http://localhost:8080/api

  constructor(private http: HttpClient) {}

  /* ───────────── stores ───────────── */

  getSellerStores(): Observable<Store[]> {
    return this.http.get<Store[]>(`${this.apiUrl}/seller/stores`);
  }

  /* ───────────── products ──────────── */

  getSellerProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/seller/products`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/seller/products/${id}`);
  }

  createProduct(body: any): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/seller/products`, body);
  }

  updateProduct(id: number, body: any): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/seller/products/${id}`, body);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/seller/products/${id}`);
  }

  /* ───────────── orders ───────────── */

  getSellerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/seller/orders`);
  }

  markOrderShipped(orderId: number, body: any): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/seller/orders/${orderId}/ship`, body);
  }

  /* ───────────── analytics ─────────── */

  /**
   * If <code>period</code> is omitted we ask the backend for the full history.
   * Accepts: daily / weekly / monthly / yearly (backend is tolerant).
   */
  getSalesStats(period?: string): Observable<{[k: string]: any}> {
    const opts = period ? { params: new HttpParams().set('period', period) } : {};
    return this.http.get<{[k: string]: any}>(`${this.apiUrl}/seller/stats`, opts);
  }
}
