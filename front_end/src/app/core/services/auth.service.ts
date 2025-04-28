import { environment } from './../../../environments/environment.development';
// core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';

export interface User {
  id: number;
  name?: string;
  email: string;
  roles: string[];
  // other user fields as needed
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  public currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = environment.apiUrl;  // e.g. "http://localhost:8080/api"

  constructor(private http: HttpClient, public tokenStorage: TokenStorageService, private router: Router) {
    // On service init, load token from storage and attempt to parse user if available
    const savedUser = this.tokenStorage.getUser();
    if (savedUser) {
      this.currentUserSubject.next(savedUser);
    }
  }

  login(email: string, password: string): Observable<any> {
    const loginData = { email, password };
    // Assume backend returns { token: 'jwt-token', user: { ... } }
    return new Observable(observer => {
      this.http.post<any>(`${this.apiUrl}/auth/login`, loginData).subscribe({
        next: response => {
          // Save token and user info
          if (response.token) {
            this.tokenStorage.saveToken(response.token);
          }
          // If backend returns user details with roles
          if (response.user) {
            this.tokenStorage.saveUser(response.user);
            this.currentUserSubject.next(response.user);
          } else {
            // If user info not returned, decode token to get roles (or call another endpoint to get profile)
            const user = this.decodeToken(response.token);
            this.tokenStorage.saveUser(user);
            this.currentUserSubject.next(user);
          }
          observer.next(true);
          observer.complete();
        },
        error: err => {
          observer.error(err);
        }
      });
    });
  }

  register(userData: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  logout(): void {
    // Clear stored data and update currentUser
    this.tokenStorage.signOut();
    this.currentUserSubject.next(null);
    // Optionally, redirect done in Header or guard if unauthorized.
  }

  // Helper to decode JWT token and extract user info (like roles)
  private decodeToken(token: string): User {
    // Basic JWT decode without external library:
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // decode payload part
      const user: User = {
        id: payload.id,
        email: payload.sub || payload.email,
        roles: payload.roles || []
      };
      // include name if present
      if (payload.name) user.name = payload.name;
      return user;
    } catch (e) {
      console.error('Failed to decode token', e);
      return { id: 0, email: '', roles: [] };
    }
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return user.roles.includes(role) || user.roles.includes(`ROLE_${role}`);
    // (assuming roles might be stored as 'ADMIN' or 'ROLE_ADMIN'; this check covers both cases)
  }
}
