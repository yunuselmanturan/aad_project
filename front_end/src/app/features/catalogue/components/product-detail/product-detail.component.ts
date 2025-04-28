import { AuthService } from './../../../../core/services/auth.service';
import { CartService } from './../../../cart/services/cart.service';
// features/catalogue/components/product-detail/product-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { ReviewService, Review } from '../../services/review.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  reviews: Review[] = [];
  private routeSub?: Subscription;
  error: string | null = null;
  isLoggedIn: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private reviewService: ReviewService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameter to load product details when ID changes
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadProduct(id);
      }
    });
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  loadProduct(productId: number): void {
    this.productService.getProductById(productId).subscribe({
      next: product => {
        this.product = product;
        // Load reviews for this product
        this.reviewService.getReviews(product.id).subscribe({
          next: reviews => this.reviews = reviews,
          error: err => console.error('Failed to load reviews', err)
        });
      },
      error: err => {
        console.error('Failed to load product', err);
        this.error = 'Product not found or an error occurred.';
      }
    });
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product, 1);
    // Optionally, we could show a success message:
    // this.notificationService.showSuccess(product.name + ' added to cart');
  }

  onReviewSubmitted(newReview: Review): void {
    // When a new review is added via ReviewForm, we append it to the list
    this.reviews.unshift(newReview);
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
}
