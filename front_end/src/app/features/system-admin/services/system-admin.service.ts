import { environment } from './../../../../environments/environment.development';
import { Order } from './../../checkout/services/order.service';
import { Product } from './../../catalogue/services/product.service';
// features/system-admin/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserAccount { id: number; name: string; email: string; roles: string[]; active: boolean; }
export interface SellerAccount extends UserAccount { companyName?: string; }

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // Analytics
  getPlatformStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/stats`);
    // e.g., returns { totalRevenue, totalUsers, totalOrders, salesByMonth: [...], newUsersByMonth: [...] }
  }

  // Users management
  getAllUsers(): Observable<UserAccount[]> {
    return this.http.get<UserAccount[]>(`${this.apiUrl}/admin/users`);
  }
  banUser(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/users/${userId}/ban`, {});
  }
  unbanUser(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/users/${userId}/unban`, {});
  }

  // Sellers management
  getAllSellers(): Observable<SellerAccount[]> {
    return this.http.get<SellerAccount[]>(`${this.apiUrl}/admin/sellers`);
  }
  // Possibly admin can create a seller or update seller's info:
  createSeller(accountData: any): Observable<SellerAccount> {
    return this.http.post<SellerAccount>(`${this.apiUrl}/admin/sellers`, accountData);
  }
  updateSeller(id: number, accountData: any): Observable<SellerAccount> {
    return this.http.put<SellerAccount>(`${this.apiUrl}/admin/sellers/${id}`, accountData);
  }
  // Could also have deleteSeller if needed

  // Orders management
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin/orders`);
  }
  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/admin/orders/${orderId}`, { status });
  }

  // Payment issues
  getPaymentIssues(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin/payment-issues`);
    // returns list of orders or transactions that have payment issues
  }
  resolvePaymentIssue(orderId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/payment-issues/${orderId}/resolve`, {});
  }
}
