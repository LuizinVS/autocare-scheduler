import { Routes } from '@angular/router';

import { adminGuard, authGuard, guestGuard, rootRedirectGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootRedirectGuard],
    loadComponent: () => import('./features/home/home-page.component').then((m) => m.HomePageComponent)
  },
  { path: 'home', loadComponent: () => import('./features/home/home-page.component').then((m) => m.HomePageComponent) },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login-page.component').then((m) => m.LoginPageComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register-page.component').then((m) => m.RegisterPageComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/client-layout.component').then((m) => m.ClientLayoutComponent),
    children: [
      { path: 'my/appointments', loadComponent: () => import('./features/appointments/my-appointments-page.component').then((m) => m.MyAppointmentsPageComponent) },
      { path: 'my/vehicles', loadComponent: () => import('./features/vehicles/my-vehicles-page.component').then((m) => m.MyVehiclesPageComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile-page.component').then((m) => m.ProfilePageComponent) }
    ]
  },
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./layouts/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.routes) },
      { path: 'clients', loadChildren: () => import('./features/clients/clients.routes').then((m) => m.routes) },
      { path: 'vehicles', loadChildren: () => import('./features/vehicles/vehicles.routes').then((m) => m.routes) },
      { path: 'service-types', loadChildren: () => import('./features/service-types/service-types.routes').then((m) => m.routes) },
      { path: 'appointments', loadChildren: () => import('./features/appointments/appointments.routes').then((m) => m.routes) }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
