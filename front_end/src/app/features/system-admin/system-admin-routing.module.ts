// features/system-admin/system-admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SellerListComponent } from './components/sellers/seller-list/seller-list.component';
import { SellerFormComponent } from './components/sellers/seller-form/seller-form.component';
import { UserListComponent } from './components/users/user-list/user-list.component';
import { GlobalOrderListComponent } from './components/global-orders/global-order-list/global-order-list.component';
import { PaymentIssuesComponent } from './components/payments/payment-issues/payment-issues.component';
import { ProductManagementComponent } from './components/products/product-management/product-management.component';
// Uncomment these imports now that the components are available
import { CategoryManagementComponent } from './components/categories/category-management/category-management.component';
import { CategoryFormComponent } from './components/categories/category-form/category-form.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'sellers', component: SellerListComponent },
  { path: 'sellers/new', component: SellerFormComponent },
  { path: 'sellers/:id', component: SellerFormComponent },
  { path: 'users', component: UserListComponent },
  { path: 'orders', component: GlobalOrderListComponent },
  { path: 'payments', component: PaymentIssuesComponent },
  { path: 'products', component: ProductManagementComponent },
  // Uncomment these routes now that the components are available
  { path: 'categories', component: CategoryManagementComponent },
  { path: 'categories/new', component: CategoryFormComponent },
  { path: 'categories/:id', component: CategoryFormComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemAdminRoutingModule { }
