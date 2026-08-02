import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';

import { environment } from '../../../environments/environment';

interface LoginResponse {
  token: string;
}

interface AuthClaims {
  userId: number | null;
  email: string | null;
  role: string | null;
  clientId: number | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenState = signal<string | null>(null);
  private readonly claimsState = signal<AuthClaims | null>(null);

  readonly token = this.tokenState.asReadonly();
  readonly claims = this.claimsState.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenState() !== null);
  readonly userId = computed(() => this.claimsState()?.userId ?? null);
  readonly email = computed(() => this.claimsState()?.email ?? null);
  readonly role = computed(() => this.claimsState()?.role ?? null);
  readonly clientId = computed(() => this.claimsState()?.clientId ?? null);

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(({ token }) => this.setSession(token)));
  }

  logout(): void {
    this.tokenState.set(null);
    this.claimsState.set(null);
  }

  private setSession(token: string): void {
    this.tokenState.set(token);
    this.claimsState.set(this.decodeClaims(token));
  }

  private decodeClaims(token: string): AuthClaims {
    try {
      const encodedPayload = token.split('.')[1];
      const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
      const payload = JSON.parse(atob(paddedPayload)) as Partial<AuthClaims>;

      return {
        userId: typeof payload.userId === 'number' ? payload.userId : null,
        email: typeof payload.email === 'string' ? payload.email : null,
        role: typeof payload.role === 'string' ? payload.role : null,
        clientId: typeof payload.clientId === 'number' ? payload.clientId : null
      };
    } catch {
      return { userId: null, email: null, role: null, clientId: null };
    }
  }
}
