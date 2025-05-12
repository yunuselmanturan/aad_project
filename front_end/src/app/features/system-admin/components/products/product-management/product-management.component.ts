import { NotificationService } from './../../../../../core/services/notification.service';
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/system-admin.service';
import { Product } from '../../../../catalogue/services/product.service';

@Component({
  selector: 'app-product-management',
  standalone: false,
  templateUrl: './product-management.component.html'
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  archivedProducts: Product[] = [];
  loading: boolean = false;
  loadingArchived: boolean = false;
  error: string | null = null;
  view: 'active' | 'archived' | 'all' = 'active';

  constructor(
    private adminService: AdminService,
    private notify: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadAllProducts();
  }

  loadAllProducts(): void {
    this.loading = true;
    this.adminService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load products', err);
        this.error = 'Could not load products. Please try again.';
        this.loading = false;
      }
    });
  }

  loadArchivedProducts(): void {
    this.loadingArchived = true;
    this.adminService.getArchivedProducts().subscribe({
      next: (products: Product[]) => {
        this.archivedProducts = products;
        this.loadingArchived = false;
      },
      error: (err: any) => {
        console.error('Failed to load archived products', err);
        this.error = 'Could not load archived products. Please try again.';
        this.loadingArchived = false;
      }
    });
  }

  loadAllProductsIncludingArchived(): void {
    this.loading = true;
    this.adminService.getAllProductsIncludingArchived().subscribe({
      next: (products: Product[]) => {
        // Separate active and archived products
        this.products = products.filter(p => p.deleted !== true);
        this.archivedProducts = products.filter(p => p.deleted === true);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load all products', err);
        this.error = 'Could not load all products. Please try again.';
        this.loading = false;
      }
    });
  }

  changeView(newView: 'active' | 'archived' | 'all'): void {
    if (newView === this.view) return;

    this.view = newView;

    switch (newView) {
      case 'active':
        this.loadAllProducts();
        break;
      case 'archived':
        if (this.archivedProducts.length === 0) {
          this.loadArchivedProducts();
        }
        break;
      case 'all':
        this.loadAllProductsIncludingArchived();
        break;
    }
  }

  removeProduct(productId: number): void {
    if (confirm('Are you sure you want to archive this product?')) {
      this.adminService.removeProduct(productId).subscribe({
        next: () => {
          this.notify.showSuccess('Product archived successfully.');
          // Refresh the list
          const product = this.products.find(p => p.id === productId);
          if (product) {
            // Remove from active list
            this.products = this.products.filter(p => p.id !== productId);
            // Add to archived list
            product.deleted = true;
            this.archivedProducts.push(product);
          }
        },
        error: (err: any) => {
          console.error('Failed to archive product', err);
          this.notify.showError('Failed to archive product.');
        }
      });
    }
  }

  activateProduct(productId: number): void {
    if (confirm('Are you sure you want to activate this product?')) {
      this.adminService.activateProduct(productId).subscribe({
        next: () => {
          this.notify.showSuccess('Product activated successfully.');
          // Refresh the list
          const product = this.archivedProducts.find(p => p.id === productId);
          if (product) {
            // Remove from archived list
            this.archivedProducts = this.archivedProducts.filter(p => p.id !== productId);
            // Add to active list
            product.deleted = false;
            this.products.push(product);
          }
        },
        error: (err: any) => {
          console.error('Failed to activate product', err);
          this.notify.showError('Failed to activate product.');
        }
      });
    }
  }
}
