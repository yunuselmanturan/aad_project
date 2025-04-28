import { NotificationService } from './../../../../core/services/notification.service';
// features/catalogue/components/review-form/review-form.component.ts
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService, Review } from '../../services/review.service';

@Component({
  selector: 'app-review-form',
  standalone: false,
  templateUrl: './review-form.component.html'
})
export class ReviewFormComponent implements OnInit {
  @Input() productId!: number;
  @Output() reviewSubmitted = new EventEmitter<Review>();
  reviewForm!: FormGroup;
  submitting: boolean = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private reviewService: ReviewService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  get f() { return this.reviewForm.controls; }

  onSubmit(): void {
    if (this.reviewForm.invalid || this.submitting) return;
    this.submitting = true;
    this.error = null;
    const reviewData = this.reviewForm.value;  // { rating: number, comment: string }
    this.reviewService.addReview(this.productId, reviewData).subscribe({
      next: (savedReview) => {
        this.submitting = false;
        this.reviewForm.reset({ rating: 5, comment: '' });  // reset form
        this.notify.showSuccess('Review submitted successfully.');
        this.reviewSubmitted.emit(savedReview);
      },
      error: err => {
        this.submitting = false;
        this.error = 'Failed to submit review. Please try again.';
        // Perhaps display error from backend if available:
        if (err.error && err.error.message) {
          this.error = err.error.message;
        }
      }
    });
  }
}
