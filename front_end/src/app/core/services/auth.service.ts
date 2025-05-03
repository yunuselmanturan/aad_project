import { environment } from './../../../environments/environment';
// core/services/auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  name?: string;
  email: string;
  roles: string[];
  // other user fields as needed
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  public currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  private apiUrl = environment.apiUrl;  // e.g. "http://localhost:8080/api"

  constructor(
    private http: HttpClient,
    public tokenStorage: TokenStorageService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // On service init, load token from storage and attempt to parse user if available
    if (this.isBrowser) {
      const savedUser = this.tokenStorage.getUser();
      if (savedUser) {
        this.currentUserSubject.next(savedUser);
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    const loginData = { email, password };
    // Use fixed URL to avoid any path issues
    return new Observable(observer => {
      this.http.post<ApiResponse<any>>('http://localhost:8080/api/auth/login', loginData).subscribe({
        next: response => {
          if (!response.success) {
            observer.error(response.message);
            return;
          }

          const data = response.data;
          // Save token and user info
          if (data.token) {
            this.tokenStorage.saveToken(data.token);
          }
          // If backend returns user details with roles
          if (data.user) {
            this.tokenStorage.saveUser(data.user);
            this.currentUserSubject.next(data.user);
          } else {
            // If user info not returned, decode token to get roles (or call another endpoint to get profile)
            const user = this.decodeToken(data.token);
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
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/register`, userData)
      .pipe(map(response => response.data));
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
      let payload;
      if (this.isBrowser) {
        payload = JSON.parse(atob(token.split('.')[1])); // decode payload part in browser
      } else {
        // Use Buffer for Node.js environment (SSR)
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
        payload = JSON.parse(jsonPayload);
      }

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
