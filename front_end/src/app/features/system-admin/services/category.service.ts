import { environment } from './../../../../environments/environment.development';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Category {
  id?: number;
  name: string;
  parentCategoryId?: number;
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
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  // Get all root categories
  getAllCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  // Get a specific category
  getCategory(id: number): Observable<Category> {
    return this.http.get<ApiResponse<Category>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  // Get subcategories
  getSubcategories(parentId: number): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/${parentId}/subcategories`)
      .pipe(map(response => response.data));
  }

  // Create a new category
  createCategory(category: Category): Observable<Category> {
    return this.http.post<ApiResponse<Category>>(this.apiUrl, category)
      .pipe(map(response => response.data));
  }

  // Update a category
  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<ApiResponse<Category>>(`${this.apiUrl}/${id}`, category)
      .pipe(map(response => response.data));
  }

  // Delete a category
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }
}
