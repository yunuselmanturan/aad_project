import { NotificationService } from './../../../../../core/services/notification.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category, CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-category-management',
  standalone: false,
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;

    this.categoryService.getAllCategoriesIncludingChildren().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.error = 'Could not load categories. Please try again.';
        this.loading = false;
      }
    });
  }

  addCategory(): void {
    this.router.navigate(['/admin/categories/new']);
  }

  editCategory(id: number | undefined): void {
    if (id) {
      this.router.navigate([`/admin/categories/${id}`]);
    }
  }

  deleteCategory(id: number | undefined): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this category? This may affect products using this category.')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Category deleted successfully');
          this.loadCategories();
        },
        error: (err) => {
          console.error('Failed to delete category', err);
          this.notificationService.showError('Failed to delete category. Please try again.');
        }
      });
    }
  }

  getParentCategoryName(parentId: number | undefined): string {
    if (!parentId) return 'None (Root Category)';
    const parent = this.categories.find(c => c.id === parentId);
    return parent ? parent.name : 'Unknown';
  }
}
