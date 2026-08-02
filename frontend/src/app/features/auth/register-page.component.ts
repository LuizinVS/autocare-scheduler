import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { PublicHeaderComponent } from '../../shared/components/public-header/public-header.component';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('passwordConfirmation')?.value
    ? null
    : { passwordsMismatch: true };
}

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [PublicHeaderComponent, ReactiveFormsModule, RouterLink],
  host: { class: 'fixed inset-0 z-50 block overflow-y-auto bg-black text-white' },
  template: `
    <div class="flex min-h-svh flex-col bg-black">
      <app-public-header />

      <main class="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
        <section class="w-full max-w-md text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.38em] text-white/45">Comece agora</p>
          <h1 class="mt-6 text-5xl font-black tracking-[-0.05em] text-white sm:text-6xl">Crie sua conta</h1>
          <p class="mx-auto mt-5 max-w-sm text-sm leading-6 text-white/55 sm:text-base">Cadastre-se para agendar serviços e cuidar do seu veículo.</p>

          <form class="mt-10 space-y-5 text-left" [formGroup]="form" (ngSubmit)="submit()">
            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-white/80">Nome</span>
              <input type="text" formControlName="name" autocomplete="name" placeholder="Seu nome" [class]="inputClasses" />
              @if (form.controls.name.touched && form.controls.name.invalid) {
                <span class="mt-2 block text-xs text-rose-300">Informe seu nome.</span>
              }
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-white/80">Telefone</span>
              <input type="tel" formControlName="phone" autocomplete="tel" placeholder="(11) 99999-9999" [class]="inputClasses" />
              @if (form.controls.phone.touched && form.controls.phone.invalid) {
                <span class="mt-2 block text-xs text-rose-300">Informe um telefone entre 8 e 15 caracteres.</span>
              }
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-white/80">E-mail</span>
              <input type="email" formControlName="email" autocomplete="email" placeholder="voce@exemplo.com" [class]="inputClasses" />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <span class="mt-2 block text-xs text-rose-300">Informe um e-mail válido.</span>
              }
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-white/80">Senha</span>
              <input type="password" formControlName="password" autocomplete="new-password" placeholder="Mínimo de 8 caracteres" [class]="inputClasses" />
              @if (form.controls.password.touched && form.controls.password.invalid) {
                <span class="mt-2 block text-xs text-rose-300">A senha deve ter pelo menos 8 caracteres.</span>
              }
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-white/80">Confirme a senha</span>
              <input type="password" formControlName="passwordConfirmation" autocomplete="new-password" placeholder="Repita sua senha" [class]="inputClasses" />
              @if (form.controls.passwordConfirmation.touched && form.hasError('passwordsMismatch')) {
                <span class="mt-2 block text-xs text-rose-300">As senhas precisam ser iguais.</span>
              }
            </label>

            @if (error()) {
              <p role="alert" class="rounded-xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{{ error() }}</p>
            }

            <button type="submit" class="w-full rounded-full bg-white px-6 py-3.5 font-bold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-60" [disabled]="submitting()">
              {{ submitting() ? 'Criando conta...' : 'Criar conta' }}
            </button>
          </form>

          <p class="mt-7 text-sm text-white/50">
            Já tem uma conta?
            <a routerLink="/login" class="font-semibold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white">Entrar</a>
          </p>
        </section>
      </main>

      <footer class="px-6 py-7 text-center text-xs text-white/25 sm:px-10 lg:px-16">© Elite Car</footer>
    </div>
  `
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly inputClasses = 'w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-white/50 focus:bg-white/[0.09]';
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirmation: ['', Validators.required]
  }, { validators: passwordsMatch });

  protected submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { name, phone, email, password } = this.form.getRawValue();
    this.auth.register({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password
    }).pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/dashboard'),
        error: (error: unknown) => {
          this.error.set(
            error instanceof HttpErrorResponse && error.status === 409
              ? 'Este e-mail já está cadastrado.'
              : 'Não foi possível criar sua conta. Revise os dados e tente novamente.'
          );
        }
      });
  }
}
