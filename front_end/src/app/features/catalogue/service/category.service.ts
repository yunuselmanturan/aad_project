import { environment } from './../../../../environments/environment';
import { NotificationService } from './../../../core/services/notification.service';
// category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { Category } from '../models/category.model';

// Interface to match backend ApiResponse structure
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'  // or provided in CatalogueModule
})
export class CategoryService {
  private apiUrl = environment.apiUrl;  // Base URL of the backend API

  constructor(
    private http: HttpClient,
    private notification: NotificationService
  ) { }

  /** Fetch all product categories from the backend (including child categories) */
  getCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/categories/all`).pipe(
      map(response => response.data),
      catchError(error => {
        // Notify user of error and rethrow for further handling if needed
        this.notification.showError('Failed to load categories');
        return throwError(() => error);
      })
    );
  }
}
