import { environment } from './../../../../environments/environment.development';
// features/catalogue/services/review.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id?: number;
  productId: number;
  userId?: number;
  username?: string;
  rating: number;
  comment: string;
  date?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getReviews(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/products/${productId}/reviews`);
    // Alternatively, /reviews?productId= if backend designed that way
  }

  addReview(productId: number, review: { rating: number, comment: string }): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/products/${productId}/reviews`, review);
  }
}
