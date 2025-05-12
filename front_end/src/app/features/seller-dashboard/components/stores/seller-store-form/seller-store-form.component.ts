import { NotificationService } from './../../../../../core/services/notification.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SellerStoreService, Store } from '../../../services/seller-store.service';

@Component({
  selector: 'app-seller-store-form',
  standalone: false,
  templateUrl: './seller-store-form.component.html',
  styleUrls: ['./seller-store-form.component.css']
})
export class SellerStoreFormComponent implements OnInit {
  storeForm: FormGroup;
  isEditMode = false;
  storeId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private storeService: SellerStoreService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.storeForm = this.fb.group({
      storeName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.storeId = +id;
        this.loadStore(this.storeId);
      }
    });
  }

  loadStore(id: number): void {
    this.loading = true;
    this.storeService.getStore(id).subscribe({
      next: (store) => {
        this.storeForm.patchValue({
          storeName: store.storeName,
          description: store.description
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load store', err);
        this.error = 'Could not load store details. Please try again.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.storeForm.invalid) {
      this.storeForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const storeData: Store = this.storeForm.value;

    if (this.isEditMode && this.storeId) {
      this.storeService.updateStore(this.storeId, storeData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Store updated successfully');
          this.router.navigate(['/seller/stores']);
        },
        error: (err) => {
          console.error('Failed to update store', err);
          this.error = 'Failed to update store. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.storeService.createStore(storeData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Store created successfully');
          this.router.navigate(['/seller/stores']);
        },
        error: (err) => {
          console.error('Failed to create store', err);
          this.error = 'Failed to create store. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/seller/stores']);
  }
}
