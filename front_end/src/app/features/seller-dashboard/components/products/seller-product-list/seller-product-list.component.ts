import { NotificationService } from './../../../../../core/services/notification.service';
import { Product } from './../../../../catalogue/services/product.service';
// features/seller-dashboard/components/products/seller-product-list/seller-product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../../services/seller.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-product-list',
  standalone: false,
  templateUrl: './seller-product-list.component.html'
})
export class SellerProductListComponent implements OnInit {
  products: Product[] = [];
  archivedProducts: Product[] = [];
  loading: boolean = true;
  loadingArchived: boolean = false;
  error: string | null = null;
  showArchived: boolean = false;

  constructor(private sellerService: SellerService, private router: Router, private notify: NotificationService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.sellerService.getSellerProducts().subscribe({
      next: prods => {
        this.products = prods;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load products', err);
        this.error = 'Could not load products.';
        this.loading = false;
      }
    });
  }

  loadArchivedProducts(): void {
    if (this.archivedProducts.length > 0 && this.showArchived) {
      // Already loaded and showing
      this.showArchived = false;
      return;
    }

    if (this.archivedProducts.length > 0) {
      // Already loaded, just show them
      this.showArchived = true;
      return;
    }

    this.loadingArchived = true;
    this.sellerService.getArchivedProducts().subscribe({
      next: prods => {
        this.archivedProducts = prods;
        this.showArchived = true;
        this.loadingArchived = false;
      },
      error: err => {
        console.error('Failed to load archived products', err);
        this.notify.showError('Could not load archived products.');
        this.loadingArchived = false;
      }
    });
  }

  editProduct(product: Product): void {
    this.router.navigate(['/seller/products', product.id, 'edit']);
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Are you sure you want to archive "${product.name}"? You can restore it later.`)) {
      return;
    }
    this.sellerService.deleteProduct(product.id).subscribe({
      next: () => {
        this.notify.showSuccess('Product archived.');
        // Remove from active list
        this.products = this.products.filter(p => p.id !== product.id);
        // Add to archived list if it's loaded
        if (this.archivedProducts.length > 0) {
          product.deleted = true;
          this.archivedProducts.push(product);
        }
      },
      error: err => {
        console.error('Archive failed', err);
        this.notify.showError('Failed to archive product.');
      }
    });
  }

  activateProduct(product: Product): void {
    if (!confirm(`Are you sure you want to restore "${product.name}" to active status?`)) {
      return;
    }
    this.sellerService.activateProduct(product.id).subscribe({
      next: () => {
        this.notify.showSuccess('Product activated.');
        // Remove from archived list
        this.archivedProducts = this.archivedProducts.filter(p => p.id !== product.id);
        // Add to active list
        product.deleted = false;
        this.products.push(product);
      },
      error: err => {
        console.error('Activation failed', err);
        this.notify.showError('Failed to activate product.');
      }
    });
  }

  addNew(): void {
    this.router.navigate(['/seller/products/new']);
  }

  toggleArchivedProducts(): void {
    if (this.archivedProducts.length === 0) {
      this.loadArchivedProducts();
    } else {
      this.showArchived = !this.showArchived;
    }
  }
}
