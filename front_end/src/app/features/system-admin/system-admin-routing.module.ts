// features/system-admin/system-admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SellerListComponent } from './components/sellers/seller-list/seller-list.component';
import { SellerFormComponent } from './components/sellers/seller-form/seller-form.component';
import { UserListComponent } from './components/users/user-list/user-list.component';
import { GlobalOrderListComponent } from './components/global-orders/global-order-list/global-order-list.component';
import { PaymentIssuesComponent } from './components/payments/payment-issues/payment-issues.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'sellers', component: SellerListComponent },
  { path: 'sellers/new', component: SellerFormComponent },
  { path: 'sellers/:id', component: SellerFormComponent },
  { path: 'users', component: UserListComponent },
  { path: 'orders', component: GlobalOrderListComponent },
  { path: 'payments', component: PaymentIssuesComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemAdminRoutingModule { }
