import { AdminService, SellerAccount } from './../../../services/system-admin.service';
// features/system-admin/components/sellers/seller-list/seller-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-list',
  standalone: false,
  templateUrl: './seller-list.component.html'
})
export class SellerListComponent implements OnInit {
  sellers: SellerAccount[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private adminService: AdminService, public router: Router) {}

  ngOnInit(): void {
    this.adminService.getAllSellers().subscribe({
      next: sellers => {
        this.sellers = sellers;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load sellers', err);
        this.error = 'Could not load sellers list.';
        this.loading = false;
      }
    });
  }

  editSeller(seller: SellerAccount): void {
    this.router.navigate(['/system-admin/sellers', seller.id]);
  }

  // Potential actions like approve or remove seller could be added here
}
