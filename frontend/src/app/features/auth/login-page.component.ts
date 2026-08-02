import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  host: { class: 'fixed inset-0 z-50 block overflow-y-auto bg-black text-white' },
  template: `
    <div class="flex min-h-svh flex-col bg-black px-6 sm:px-10 lg:px-16">
      <header class="mx-auto flex w-full max-w-7xl items-center justify-between py-7 sm:py-9">
        <a routerLink="/login" class="text-xl font-black uppercase tracking-[0.18em] text-white sm:text-2xl">
          Elite Car
        </a>

        <nav aria-label="Navegação institucional" class="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a href="#" class="transition hover:text-white">Sobre</a>
          <a href="#" class="transition hover:text-white">Serviços</a>
          <a href="#" class="transition hover:text-white">Contato</a>
        </nav>

        <a
          routerLink="/login"
          class="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-black"
        >Entrar</a>
      </header>

      <main class="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center py-12 sm:py-16">
        <section class="w-full max-w-md text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.38em] text-white/45">Área exclusiva</p>
          <h1 class="mt-6 text-5xl font-black tracking-[-0.05em] text-white sm:text-6xl">Acesse sua conta</h1>
          <p class="mx-auto mt-5 max-w-sm text-sm leading-6 text-white/55 sm:text-base">
            Entre para gerenciar seus veículos e acompanhar seus agendamentos.
          </p>

          <form class="mt-10 space-y-5 text-left" [formGroup]="form" (ngSubmit)="submit()">
            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-white/80">E-mail</span>
              <input
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="voce@exemplo.com"
                class="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-white/50 focus:bg-white/[0.09]"
              />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <span class="mt-2 block text-xs text-rose-300">Informe um e-mail válido.</span>
              }
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-white/80">Senha</span>
              <input
                type="password"
                formControlName="password"
                autocomplete="current-password"
                placeholder="Sua senha"
                class="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-white/50 focus:bg-white/[0.09]"
              />
              @if (form.controls.password.touched && form.controls.password.invalid) {
                <span class="mt-2 block text-xs text-rose-300">A senha deve ter pelo menos 8 caracteres.</span>
              }
            </label>

            @if (error()) {
              <p role="alert" class="rounded-xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                {{ error() }}
              </p>
            }

            <button
              type="submit"
              class="w-full rounded-full bg-white px-6 py-3.5 font-bold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-60"
              [disabled]="submitting()"
            >{{ submitting() ? 'Entrando...' : 'Entrar' }}</button>
          </form>

          <p class="mt-7 text-sm text-white/50">
            Não tem uma conta?
            <a routerLink="/register" class="font-semibold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white">
              Cadastre-se
            </a>
          </p>
        </section>
      </main>

      <footer class="py-7 text-center text-xs text-white/25">© Elite Car</footer>
    </div>
  `
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  protected submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email.trim(), password)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/dashboard'),
        error: (error: unknown) => {
          this.error.set(
            error instanceof HttpErrorResponse && error.status === 401
              ? 'E-mail ou senha inválidos.'
              : 'Não foi possível entrar. Tente novamente.'
          );
        }
      });
  }
}
