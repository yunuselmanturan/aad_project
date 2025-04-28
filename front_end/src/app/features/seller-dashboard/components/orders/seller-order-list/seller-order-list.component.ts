import { Order } from './../../../../checkout/services/order.service';
import { NotificationService } from './../../../../../core/services/notification.service';
// features/seller-dashboard/components/orders/seller-order-list/seller-order-list.component.ts
import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../../services/seller.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-order-list',
  standalone: false,
  templateUrl: './seller-order-list.component.html'
})
export class SellerOrderListComponent implements OnInit {
  orders: Order[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private sellerService: SellerService, private router: Router, private notify: NotificationService) {}

  ngOnInit(): void {
    this.sellerService.getSellerOrders().subscribe({
      next: orders => {
        this.orders = orders;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to fetch seller orders', err);
        this.error = 'Could not load orders.';
        this.loading = false;
      }
    });
  }

  markShipped(order: Order): void {
    // Possibly open a dialog or navigate to shipment form
    this.router.navigate(['/seller/shipments', order.id]);
  }

  sellerRevenue(order: Order): number {
    // Sum up price × quantity for all items, since the order is already seller-specific
    return order.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

}
