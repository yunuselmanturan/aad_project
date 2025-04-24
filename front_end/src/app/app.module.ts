import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { AccessDeniedComponent } from './core/access-denied/access-denied.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { MoneyPipe } from './core/shared/pipes/money.pipe';
import { ProductListComponent } from './features/catalogue/components/product-list/product-list.component';
import { ProductDetailComponent } from './features/catalogue/components/product-detail/product-detail.component';
import { ProductCardComponent } from './features/catalogue/components/product-card/product-card.component';
import { ProductFilterComponent } from './features/catalogue/components/product-filter/product-filter.component';
import { CompareDialogComponent } from './features/catalogue/components/compare-dialog/compare-dialog.component';
import { ReviewListComponent } from './features/catalogue/components/review-list/review-list.component';
import { ReviewFormComponent } from './features/catalogue/components/review-form/review-form.component';
import { CartComponent } from './features/cart/components/cart/cart.component';
import { CartItemComponent } from './features/cart/components/cart-item/cart-item.component';
import { CheckoutComponent } from './features/checkout/components/checkout/checkout.component';
import { PaymentComponent } from './features/checkout/components/payment/payment.component';
import { OrderSuccessComponent } from './features/checkout/components/order-success/order-success.component';
import { OrderHistoryComponent } from './features/orders/components/order-history/order-history.component';
import { OrderDetailComponent } from './features/orders/components/order-detail/order-detail.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { UserProfileComponent } from './features/auth/components/user-profile/user-profile.component';
import { SellerDashboardComponent } from './features/seller-dashboard/components/dashboard/seller-dashboard.component';
import { SellerProductListComponent } from './features/seller-dashboard/components/products/seller-product-list/seller-product-list.component';
import { SellerProductFormComponent } from './features/seller-dashboard/components/products/seller-product-form/seller-product-form.component';
import { SellerOrderListComponent } from './features/seller-dashboard/components/orders/seller-order-list/seller-order-list.component';
import { ShipmentTrackingComponent } from './features/seller-dashboard/components/shipments/shipment-tracking/shipment-tracking.component';
import { SellerListComponent } from './features/system-admin/components/sellers/seller-list/seller-list.component';
import { SellerFormComponent } from './features/system-admin/components/sellers/seller-form/seller-form.component';
import { UserListComponent } from './features/system-admin/components/users/user-list/user-list.component';
import { GlobalOrderListComponent } from './features/system-admin/components/global-orders/global-order-list/global-order-list.component';
import { PaymentIssuesComponent } from './features/system-admin/components/payments/payment-issues/payment-issues.component';
import { DashboardComponent } from './features/system-admin/components/dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    NotFoundComponent,
    AccessDeniedComponent,
    ConfirmDialogComponent,
    LoadingSpinnerComponent,
    MoneyPipe,
    ProductListComponent,
    ProductDetailComponent,
    ProductCardComponent,
    ProductFilterComponent,
    CompareDialogComponent,
    ReviewListComponent,
    ReviewFormComponent,
    CartComponent,
    CartItemComponent,
    CheckoutComponent,
    PaymentComponent,
    OrderSuccessComponent,
    OrderHistoryComponent,
    OrderDetailComponent,
    LoginComponent,
    RegisterComponent,
    UserProfileComponent,
    DashboardComponent,
    SellerProductListComponent,
    SellerProductFormComponent,
    SellerOrderListComponent,
    ShipmentTrackingComponent,
    SellerListComponent,
    SellerFormComponent,
    UserListComponent,
    GlobalOrderListComponent,
    PaymentIssuesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
