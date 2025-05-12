import { environment } from './../../../../environments/environment.development';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Store {
  id?: number;
  sellerId?: number;
  sellerName?: string;
  storeName: string;
  description?: string;
  createdAt?: Date;
}

// Interface to match backend ApiResponse structure
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SellerStoreService {
  private apiUrl = `${environment.apiUrl}/seller/stores`;

  constructor(private http: HttpClient) { }

  // Get all stores for current seller
  getStores(): Observable<Store[]> {
    return this.http.get<ApiResponse<Store[]>>(this.apiUrl)
      .pipe(
        map(response => {
          console.log('Raw API response:', response);
          return response.data;
        })
      );
  }

  // Get a specific store
  getStore(id: number): Observable<Store> {
    return this.http.get<ApiResponse<Store>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  // Create a new store
  createStore(store: Store): Observable<Store> {
    return this.http.post<ApiResponse<Store>>(this.apiUrl, store)
      .pipe(map(response => response.data));
  }

  // Update a store
  updateStore(id: number, store: Store): Observable<Store> {
    return this.http.put<ApiResponse<Store>>(`${this.apiUrl}/${id}`, store)
      .pipe(map(response => response.data));
  }

  // Delete a store
  deleteStore(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }
}
