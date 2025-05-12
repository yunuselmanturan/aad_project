import { NotificationService } from './../../../../../core/services/notification.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SellerStoreService, Store } from '../../../services/seller-store.service';

@Component({
  selector: 'app-seller-store-list',
  standalone: false,
  templateUrl: './seller-store-list.component.html',
  styleUrls: ['./seller-store-list.component.css']
})
export class SellerStoreListComponent implements OnInit {
  stores: Store[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private storeService: SellerStoreService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadStores();
  }

  loadStores(): void {
    this.loading = true;
    this.error = null;

    this.storeService.getStores().subscribe({
      next: (data) => {
        this.stores = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load stores', err);
        this.error = 'Could not load stores. Please try again.';
        this.loading = false;
      }
    });
  }

  addStore(): void {
    this.router.navigate(['/seller/stores/new']);
  }

  editStore(id: number | undefined): void {
    if (id) {
      this.router.navigate([`/seller/stores/${id}/edit`]);
    }
  }

  deleteStore(id: number | undefined): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      this.storeService.deleteStore(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Store deleted successfully');
          this.loadStores();
        },
        error: (err) => {
          console.error('Failed to delete store', err);
          this.notificationService.showError('Failed to delete store. Please try again.');
        }
      });
    }
  }
}
