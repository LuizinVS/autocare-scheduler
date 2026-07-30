import { Routes } from '@angular/router';

import { ClientDetailComponent } from './client-detail.component';
import { ClientsPageComponent } from './clients-page.component';

export const routes: Routes = [
  { path: '', component: ClientsPageComponent },
  { path: ':id', component: ClientDetailComponent }
];
