import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'login',
		loadComponent: () => import('./features/auth/login-page.component').then((m) => m.LoginPageComponent)
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'dashboard'
	},
	{
		path: 'dashboard',
		loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.routes)
	},
	{
		path: 'clients',
		loadChildren: () => import('./features/clients/clients.routes').then((m) => m.routes)
	},
	{
		path: 'vehicles',
		loadChildren: () => import('./features/vehicles/vehicles.routes').then((m) => m.routes)
	},
	{
		path: 'service-types',
		loadChildren: () => import('./features/service-types/service-types.routes').then((m) => m.routes)
	},
	{
		path: 'appointments',
		loadChildren: () => import('./features/appointments/appointments.routes').then((m) => m.routes)
	},
	{
		path: '**',
		redirectTo: 'dashboard'
	}
];
