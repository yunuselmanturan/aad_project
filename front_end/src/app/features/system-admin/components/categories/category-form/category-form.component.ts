import { NotificationService } from './../../../../../core/services/notification.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: false,
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditMode = false;
  categoryId: number | null = null;
  loading = false;
  error: string | null = null;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      parentCategoryId: [null]
    });
  }

  ngOnInit(): void {
    this.loadAllCategories();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.categoryId = +id;
        this.loadCategory(this.categoryId);
      }
    });
  }

  loadAllCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.error = 'Could not load parent categories. Please try again.';
      }
    });
  }

  loadCategory(id: number): void {
    this.loading = true;
    this.categoryService.getCategory(id).subscribe({
      next: (category) => {
        this.categoryForm.patchValue({
          name: category.name,
          parentCategoryId: category.parentCategoryId
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load category', err);
        this.error = 'Could not load category details. Please try again.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const categoryData: Category = this.categoryForm.value;

    if (this.isEditMode && this.categoryId) {
      this.categoryService.updateCategory(this.categoryId, categoryData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Category updated successfully');
          this.router.navigate(['/admin/categories']);
        },
        error: (err) => {
          console.error('Failed to update category', err);
          this.error = 'Failed to update category. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.categoryService.createCategory(categoryData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Category created successfully');
          this.router.navigate(['/admin/categories']);
        },
        error: (err) => {
          console.error('Failed to create category', err);
          this.error = 'Failed to create category. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/categories']);
  }
}
