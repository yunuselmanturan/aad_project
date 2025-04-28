import { environment } from './../../../../environments/environment';
// features/seller-dashboard/services/seller.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../catalogue/services/product.service';
import { Order } from '../../checkout/services/order.service';

@Injectable({ providedIn: 'root' })
export class SellerService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // Products management
  getSellerProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/seller/products`);
    // Only returns products belonging to the logged-in seller
  }
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/seller/products/${id}`);
  }
  createProduct(productData: any): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/seller/products`, productData);
  }
  updateProduct(id: number, productData: any): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/seller/products/${id}`, productData);
  }
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/seller/products/${id}`);
  }

  // Orders management
  getSellerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/seller/orders`);
    // Returns orders that include products of this seller
  }
  markOrderShipped(orderId: number, trackingInfo: any): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/seller/orders/${orderId}/ship`, trackingInfo);
    // Mark order as shipped, attach tracking (trackingInfo could include tracking number, carrier, etc.)
  }

  // Analytics
  getSalesStats(): Observable<{[key: string]: any}> {
    return this.http.get<{[key: string]: any}>(`${this.apiUrl}/seller/stats`);
    // E.g., returns { monthlySales: [...], totalRevenue: ..., etc. }
  }
}
