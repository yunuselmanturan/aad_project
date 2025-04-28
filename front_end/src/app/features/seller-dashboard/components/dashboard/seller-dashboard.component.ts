// features/seller-dashboard/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../services/seller.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: false,
  templateUrl: './seller-dashboard.component.html'
})
export class SellerDashboardComponent implements OnInit {
  stats: any;
  error: string | null = null;
  loading: boolean = true;

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.sellerService.getSalesStats().subscribe({
      next: data => {
        this.stats = data;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load sales stats', err);
        this.error = 'Could not load analytics.';
        this.loading = false;
      }
    });
  }
}
