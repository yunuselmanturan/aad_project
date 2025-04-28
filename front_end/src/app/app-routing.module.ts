import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CoreModule } from './core/core.module';
import { NotFoundComponent } from './core/not-found/not-found.component';

const routes: Routes = [
  // Default route (for example, redirect to catalogue listing on empty path)
  { path: '', redirectTo: '/catalogue', pathMatch: 'full' },

  // Lazy-loaded feature modules
  { path: 'catalogue', loadChildren: () => import('./features/catalogue/catalogue.module').then(m => m.CatalogueModule) },
  { path: 'cart', loadChildren: () => import('./features/cart/cart.module').then(m => m.CartModule) },
  { path: 'checkout', loadChildren: () => import('./features/checkout/checkout.module').then(m => m.CheckoutModule) },
  { path: 'orders', loadChildren: () => import('./features/orders/orders.module').then(m => m.OrdersModule) },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },

  // Admin feature modules (protected by guards)
  {
    path: 'seller-dashboard',
    canLoad: [/*AuthGuard, SellerAdminGuard*/],  // guards defined in CoreModule
    loadChildren: () => import('./features/seller-dashboard/seller-dashboard.module').then(m => m.SellerDashboardModule)
  },
  {
    path: 'system-admin',
    canLoad: [/*AuthGuard, SystemAdminGuard*/],  // only allow SYSTEM_ADMIN role
    loadChildren: () => import('./features/system-admin/system-admin.module').then(m => m.SystemAdminModule)
  },

  { path: '**', component: NotFoundComponent }  // Wildcard route for 404 page

  // Note: We do NOT define 'access-denied' or '**' here.
  // Those are now handled in CoreRoutingModule (imported via CoreModule).
];

@NgModule({
  imports: [ RouterModule.forRoot(routes), CoreModule ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
