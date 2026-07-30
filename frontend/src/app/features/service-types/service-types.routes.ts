import { Routes } from '@angular/router';

import { ServiceTypesPageComponent } from './service-types-page.component';
import { ServiceTypeDetailComponent } from './service-type-detail.component';

export const routes: Routes = [
  { path: '', component: ServiceTypesPageComponent },
  { path: ':id', component: ServiceTypeDetailComponent }
];
