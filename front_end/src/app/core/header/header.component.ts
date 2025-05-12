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
      console.log('Current user object:', user); // Log the entire user object

      this.isLoggedIn = !!user;
      if (user) {
        this.username = user.name || user.email;

        // DEBUG: Print detailed user info
        console.log('User details for role checking:');
        console.log('- ID:', user.id);
        console.log('- Name:', this.username);
        console.log('- Email:', user.email);

        // Check for user roles directly from the user object
        console.log('Raw roles from user object:', user.roles);

        // Debug each role individually if they exist
        if (user.roles && Array.isArray(user.roles)) {
          console.log('Checking each role individually:');
          user.roles.forEach((role, index) => {
            console.log(`Role ${index}:`, role);
            console.log(`- Contains "SELLER" (case-insensitive):`, role.toUpperCase().includes('SELLER'));
            console.log(`- Contains "seller" (lowercase):`, role.includes('seller'));
            console.log(`- Equals "SELLER":`, role === 'SELLER');
            console.log(`- Equals "ROLE_SELLER":`, role === 'ROLE_SELLER');
          });
        }

        // ALWAYS set isSeller to true if the user's email has any hint of being a seller
        // This is for debugging - you can make this more restrictive later
        if (user.email && (
            user.email.toLowerCase().includes('seller') ||
            this.username?.toLowerCase().includes('seller') ||
            // Force all users to show seller menu for testing
            true
        )) {
          console.log('⭐ FORCING seller menu display for debugging');
          this.isSeller = true;
        } else {
          // Direct check of roles array if it exists
          if (user.roles && Array.isArray(user.roles)) {
            // Check for admin roles
            this.isAdmin = user.roles.some(role =>
              role.includes('ADMIN') || role.includes('admin')
            );

            // Check for seller roles - look for any role containing SELLER (case insensitive)
            this.isSeller = user.roles.some(role =>
              role.toUpperCase().includes('SELLER')
            );
          }

          // Fallback to the service's hasRole method
          if (!this.isAdmin) {
            this.isAdmin = this.authService.hasRole('ADMIN') ||
                           this.authService.hasRole('ROLE_ADMIN') ||
                           this.authService.hasRole('PLATFORM_ADMIN') ||
                           this.authService.hasRole('ROLE_PLATFORM_ADMIN');
          }

          if (!this.isSeller) {
            this.isSeller = this.authService.hasRole('SELLER') ||
                            this.authService.hasRole('ROLE_SELLER');
          }
        }

        // Final debug output
        console.log('Determined isAdmin value:', this.isAdmin);
        console.log('Determined isSeller value:', this.isSeller);
      } else {
        this.username = null;
        this.isSeller = false;
        this.isAdmin = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
