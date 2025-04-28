import { NotificationService } from './../../../../../core/services/notification.service';
// features/seller-dashboard/components/products/seller-product-form/seller-product-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SellerService } from '../../../services/seller.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-seller-product-form',
  standalone: false,
  templateUrl: './seller-product-form.component.html'
})
export class SellerProductFormComponent implements OnInit {
  productForm!: FormGroup;
  editing: boolean = false;
  productId: number | null = null;
  error: string | null = null;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private sellerService: SellerService, private route: ActivatedRoute, private router: Router, private notify: NotificationService) {}

  ngOnInit(): void {
    // Initialize form fields
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      description: ['']
      // we could add stock, etc.
    });
    // Check if we are editing an existing product
    if (this.route.snapshot.paramMap.get('id')) {
      this.editing = true;
      this.productId = Number(this.route.snapshot.paramMap.get('id'));
      this.loading = true;
      // Load product data to edit
      this.sellerService.getProduct(this.productId).subscribe({
        next: product => {
          this.productForm.patchValue(product);
          this.loading = false;
        },
        error: err => {
          console.error('Failed to load product', err);
          this.error = 'Product not found.';
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;
    this.error = null;
    this.loading = true;
    const productData = this.productForm.value;
    if (this.editing && this.productId != null) {
      this.sellerService.updateProduct(this.productId, productData).subscribe({
        next: updated => {
          this.notify.showSuccess('Product updated.');
          this.router.navigate(['/seller/products']);
        },
        error: err => {
          console.error('Update failed', err);
          this.error = 'Failed to update product.';
          this.loading = false;
        }
      });
    } else {
      this.sellerService.createProduct(productData).subscribe({
        next: created => {
          this.notify.showSuccess('Product created.');
          this.router.navigate(['/seller/products']);
        },
        error: err => {
          console.error('Creation failed', err);
          this.error = 'Failed to create product.';
          this.loading = false;
        }
      });
    }
  }
}
