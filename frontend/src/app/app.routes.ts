import { Routes } from '@angular/router';

import { authGuard, guestGuard, rootRedirectGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		canActivate: [rootRedirectGuard],
		loadComponent: () => import('./features/home/home-page.component').then((m) => m.HomePageComponent)
	},
	{
		path: 'home',
		loadComponent: () => import('./features/home/home-page.component').then((m) => m.HomePageComponent)
	},
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
		path: 'dashboard',
		canActivate: [authGuard],
		loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.routes)
	},
	{
		path: 'clients',
		canActivate: [authGuard],
		loadChildren: () => import('./features/clients/clients.routes').then((m) => m.routes)
	},
	{
		path: 'vehicles',
		canActivate: [authGuard],
		loadChildren: () => import('./features/vehicles/vehicles.routes').then((m) => m.routes)
	},
	{
		path: 'service-types',
		canActivate: [authGuard],
		loadChildren: () => import('./features/service-types/service-types.routes').then((m) => m.routes)
	},
	{
		path: 'appointments',
		canActivate: [authGuard],
		loadChildren: () => import('./features/appointments/appointments.routes').then((m) => m.routes)
	},
	{
		path: '**',
		redirectTo: 'home'
	}
];
