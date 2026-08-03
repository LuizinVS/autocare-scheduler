import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';

function authenticatedDestination(auth: AuthService): string {
  return auth.authenticatedHome();
}

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.initialize().pipe(
    map(() => auth.isAuthenticated() ? true : router.createUrlTree(['/login']))
  );
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.initialize().pipe(
    map(() => auth.role() === 'ADMIN' ? true : router.createUrlTree([auth.isAuthenticated() ? '/my/appointments' : '/login']))
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.initialize().pipe(
    map(() => auth.isAuthenticated() ? router.createUrlTree([authenticatedDestination(auth)]) : true)
  );
};

export const rootRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.initialize().pipe(
    map(() => router.createUrlTree([auth.isAuthenticated() ? authenticatedDestination(auth) : '/home']))
  );
};
