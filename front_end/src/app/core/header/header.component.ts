// core/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  username: string | null = null;
  isSeller: boolean = false;
  isAdmin: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // Subscribe to login status
    this.authService.currentUser$.subscribe(user => {
      console.log('Current user object:', user);

      this.isLoggedIn = !!user;
      if (user) {
        this.username = user.name || user.email;

        // Reset role flags
        this.isAdmin = false;
        this.isSeller = false;

        console.log('Checking user roles:', user.roles);

        // Extremely permissive admin detection - if any role contains the word "admin" (case insensitive)
        // This should catch any possible admin role format
        if (user.roles && Array.isArray(user.roles)) {
          console.log('Role array length:', user.roles.length);

          // Print all roles for debugging
          user.roles.forEach((role, index) => {
            console.log(`Role ${index}:`, role);
          });

          // Check for admin roles using substring matching (case insensitive)
          this.isAdmin = user.roles.some(role => {
            if (typeof role === 'string' && role.toUpperCase().includes('ADMIN')) {
              console.log('Admin role found (case insensitive):', role);
              return true;
            }
            return false;
          });

          // If admin role not found in array, check using auth service
          if (!this.isAdmin) {
            // Use auth service as fallback
            const adminRoles = ['PLATFORM_ADMIN', 'ADMIN', 'ROLE_ADMIN'];
            for (const role of adminRoles) {
              if (this.authService.hasRole(role)) {
                console.log('Admin role found via auth service:', role);
                this.isAdmin = true;
                break;
              }
            }
          }

          console.log('isAdmin after checks:', this.isAdmin);

          // Special case: check if email contains "admin" as a fallback
          if (!this.isAdmin && user.email && user.email.toLowerCase().includes('admin')) {
            console.log('Admin detected from email:', user.email);
            this.isAdmin = true;
          }

          // Only check for seller role if not admin
          if (!this.isAdmin) {
            // Check for seller roles
            this.isSeller = user.roles.some(role => {
              if (typeof role === 'string' && role.toUpperCase().includes('SELLER')) {
                console.log('Seller role found (case insensitive):', role);
                return true;
              }
              return false;
            });

            // If seller role not found in array, check using auth service
            if (!this.isSeller) {
              const sellerRoles = ['SELLER', 'ROLE_SELLER'];
              for (const role of sellerRoles) {
                if (this.authService.hasRole(role)) {
                  console.log('Seller role found via auth service:', role);
                  this.isSeller = true;
                  break;
                }
              }
            }

            // Special case: check if email contains "seller" as a fallback
            if (!this.isSeller && user.email && user.email.toLowerCase().includes('seller')) {
              console.log('Seller detected from email:', user.email);
              this.isSeller = true;
            }

            console.log('isSeller after all checks:', this.isSeller);
          }
        } else {
          console.log('Roles is not an array or is undefined:', user.roles);

          // Even if roles isn't an array, check email as a last resort
          if (user.email) {
            if (user.email.toLowerCase().includes('admin')) {
              console.log('Admin detected from email (fallback):', user.email);
              this.isAdmin = true;
            } else if (user.email.toLowerCase().includes('seller')) {
              console.log('Seller detected from email (fallback):', user.email);
              this.isSeller = true;
            }
          }
        }

        // Final determination
        console.log('FINAL ROLE DETERMINATION:');
        console.log('- isAdmin:', this.isAdmin);
        console.log('- isSeller:', this.isSeller);
      } else {
        this.username = null;
        this.isAdmin = false;
        this.isSeller = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
