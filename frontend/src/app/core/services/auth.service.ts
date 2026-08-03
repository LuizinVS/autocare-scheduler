import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export type UserRole = 'ADMIN' | 'CLIENT';

interface CurrentUser {
  email: string;
  role: UserRole;
  clientId: number | null;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly currentUserState = signal<CurrentUser | null>(null);
  private readonly initialization$ = this.loadCurrentUser().pipe(
    map(() => undefined),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  readonly currentUser = this.currentUserState.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserState() !== null);
  readonly email = computed(() => this.currentUserState()?.email ?? null);
  readonly role = computed(() => this.currentUserState()?.role ?? null);
  readonly clientId = computed(() => this.currentUserState()?.clientId ?? null);
  readonly authenticatedHome = computed(() => this.role() === 'CLIENT' ? '/my/appointments' : '/dashboard');

  initialize(): Observable<void> {
    return this.initialization$;
  }

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<void>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        switchMap(() => this.loadCurrentUser()),
        map(() => undefined)
      );
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http
      .post<void>(`${environment.apiUrl}/auth/register`, request)
      .pipe(
        switchMap(() => this.loadCurrentUser()),
        map(() => undefined)
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}).pipe(
      catchError(() => of(undefined)),
      finalize(() => this.currentUserState.set(null))
    );
  }

  private loadCurrentUser(): Observable<CurrentUser | null> {
    return this.http.get<CurrentUser>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => this.currentUserState.set(user)),
      catchError(() => {
        this.currentUserState.set(null);
        return of(null);
      })
    );
  }
}
