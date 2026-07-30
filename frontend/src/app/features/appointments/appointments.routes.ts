import { Routes } from '@angular/router';

import { AppointmentsPageComponent } from './appointments-page.component';
import { AppointmentDetailComponent } from './appointment-detail.component';

export const routes: Routes = [
  { path: '', component: AppointmentsPageComponent },
  { path: ':id', component: AppointmentDetailComponent }
];
