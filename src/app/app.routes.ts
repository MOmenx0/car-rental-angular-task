import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestOnlyGuard } from './core/guards/guest-only.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'lcars', pathMatch: 'full', redirectTo: 'cars' },

  {
    path: 'login',
    canMatch: [guestOnlyGuard],
    loadComponent: () => import('./features/auth/login-page/login-page.component').then(m => m.LoginPageComponent)
  },
  {
    path: 'register',
    canMatch: [guestOnlyGuard],
    loadComponent: () =>
      import('./features/auth/register-page/register-page.component').then(m => m.RegisterPageComponent)
  },

  {
    path: 'admin/users',
    canMatch: [authGuard, roleGuard('Admin')],
    loadComponent: () =>
      import('./features/admin/users/admin-users-page/admin-users-page.component').then(m => m.AdminUsersPageComponent)
  },
  {
    path: 'admin/users/:id',
    canMatch: [authGuard, roleGuard('Admin')],
    loadComponent: () =>
      import('./features/admin/users/admin-user-details-page/admin-user-details-page.component').then(
        m => m.AdminUserDetailsPageComponent
      )
  },
  {
    path: 'admin/cars',
    canMatch: [authGuard, roleGuard('Admin')],
    loadComponent: () =>
      import('./features/admin/cars/admin-cars-page/admin-cars-page.component').then(m => m.AdminCarsPageComponent)
  },
  {
    path: 'admin/cars/:id',
    canMatch: [authGuard, roleGuard('Admin')],
    loadComponent: () =>
      import('./features/admin/cars/admin-car-details-page/admin-car-details-page.component').then(
        m => m.AdminCarDetailsPageComponent
      )
  },
  {
    path: 'admin/orders',
    canMatch: [authGuard, roleGuard('Admin')],
    loadComponent: () =>
      import('./features/admin/orders/admin-orders-page/admin-orders-page.component').then(m => m.AdminOrdersPageComponent)
  },
  {
    path: 'admin/orders/:id',
    canMatch: [authGuard, roleGuard('Admin')],
    loadComponent: () =>
      import('./features/admin/orders/admin-order-details-page/admin-order-details-page.component').then(
        m => m.AdminOrderDetailsPageComponent
      )
  },

  {
    path: 'cars',
    canMatch: [authGuard, roleGuard('Customer')],
    loadComponent: () => import('./features/customer/cars/cars-page/cars-page.component').then(m => m.CarsPageComponent)
  },
  {
    path: 'cars/:id',
    canMatch: [authGuard, roleGuard('Customer')],
    loadComponent: () =>
      import('./features/customer/cars/car-details-page/car-details-page.component').then(m => m.CarDetailsPageComponent)
  },
  {
    path: 'orders',
    canMatch: [authGuard, roleGuard('Customer')],
    loadComponent: () =>
      import('./features/customer/orders/orders-page/orders-page.component').then(m => m.OrdersPageComponent)
  },
  {
    path: 'orders/:id',
    canMatch: [authGuard, roleGuard('Customer')],
    loadComponent: () =>
      import('./features/customer/orders/order-details-page/order-details-page.component').then(m => m.OrderDetailsPageComponent)
  },
  {
    path: 'installments',
    canMatch: [authGuard, roleGuard('Customer')],
    loadComponent: () =>
      import('./features/customer/installments/installments-page/installments-page.component').then(
        m => m.InstallmentsPageComponent
      )
  },

  { path: '**', redirectTo: 'login' }
];
