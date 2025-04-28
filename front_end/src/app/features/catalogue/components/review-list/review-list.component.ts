// features/catalogue/components/review-list/review-list.component.ts
import { Component, Input } from '@angular/core';
import { Review } from '../../services/review.service';

@Component({
  selector: 'app-review-list',
  standalone: false,
  template: `
    <div *ngIf="reviews && reviews.length; else noReviews">
      <div *ngFor="let review of reviews" class="review-item">
        <strong>{{ review.username || 'User ' + review.userId }}</strong>
        <span class="rating">Rating: {{ review.rating }}/5</span>
        <p>{{ review.comment }}</p>
        <small class="date">{{ review.date | date:'medium' }}</small>
      </div>
    </div>
    <ng-template #noReviews>
      <p>No reviews yet.</p>
    </ng-template>
  `,
  styles: [`
    .review-item { border-bottom: 1px solid #ccc; padding: 0.5rem 0; }
    .rating { margin-left: 1rem; color: #ff9800; }
    .date { color: #777; }
  `]
})
export class ReviewListComponent {
  @Input() reviews: Review[] = [];
}
