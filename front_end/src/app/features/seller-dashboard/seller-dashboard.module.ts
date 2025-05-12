import { SellerDashboardComponent } from './components/dashboard/seller-dashboard.component';
import { SharedModule } from './../../shared/shared.module';
// features/seller-dashboard/seller-dashboard.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellerDashboardRoutingModule } from './seller-dashboard-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

import { SellerProductListComponent } from './components/products/seller-product-list/seller-product-list.component';
import { SellerProductFormComponent } from './components/products/seller-product-form/seller-product-form.component';
import { SellerOrderListComponent } from './components/orders/seller-order-list/seller-order-list.component';
import { ShipmentTrackingComponent } from './components/shipments/shipment-tracking/shipment-tracking.component';
import { SellerStoreListComponent } from './components/stores/seller-store-list/seller-store-list.component';
import { SellerStoreFormComponent } from './components/stores/seller-store-form/seller-store-form.component';

@NgModule({
  declarations: [
    SellerDashboardComponent,
    SellerProductListComponent,
    SellerProductFormComponent,
    SellerOrderListComponent,
    ShipmentTrackingComponent,
    SellerStoreListComponent,
    SellerStoreFormComponent
  ],
  imports: [ CommonModule, ReactiveFormsModule, SharedModule, SellerDashboardRoutingModule ]
})
export class SellerDashboardModule { }
