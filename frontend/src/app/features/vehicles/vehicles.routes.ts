import { Routes } from '@angular/router';

import { VehiclesPageComponent } from './vehicles-page.component';
import { VehicleDetailComponent } from './vehicle-detail.component';

export const routes: Routes = [
  { path: '', component: VehiclesPageComponent },
  { path: ':id', component: VehicleDetailComponent }
];
