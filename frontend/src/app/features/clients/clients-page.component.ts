import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ClientService } from '../../core/services/client';
import { FeedbackService } from '../../core/services/feedback.service';
import { ApiPage } from '../../shared/models/api-page.model';
import { Client } from '../../shared/models/client.model';
import { ClientDTO } from '../../shared/models/client-dto.model';
import { formatLocalDateTime } from '../../shared/utils/date-time';

@Component({
  standalone: true,
  selector: 'app-clients-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-sky-700">Clientes</p>
            <h2 class="mt-1 text-3xl font-black text-slate-900">Listagem paginada</h2>
          </div>
          <button type="button" class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700" (click)="loadPage(page().number)">Recarregar</button>
        </div>

        @if (loading()) {
          <p class="mt-6 text-sm text-slate-500">Carregando clientes...</p>
        } @else if (error()) {
          <div class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><p>{{ error() }}</p><button type="button" class="mt-2 font-semibold underline" (click)="loadPage(page().number)">Tentar novamente</button></div>
        } @else if (page().content.length === 0) {
          <p class="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Nenhum cliente encontrado.</p>
        } @else {
          <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr>
                  <th class="px-4 py-3 font-semibold">Nome</th>
                  <th class="px-4 py-3 font-semibold">Contato</th>
                  <th class="px-4 py-3 font-semibold">Criado em</th>
                  <th class="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                @for (client of page().content; track client.id) {
                  <tr>
                    <td class="px-4 py-3 font-medium text-slate-900">{{ client.name }}</td>
                    <td class="px-4 py-3 text-slate-600">
                      <div>{{ client.phone }}</div>
                      <div>{{ client.email }}</div>
                    </td>
                    <td class="px-4 py-3 text-slate-500">{{ formatDateTime(client.createdAt) }}</td>
                    <td class="px-4 py-3 text-right"><a [routerLink]="['/clients', client.id]" class="font-semibold text-sky-700">Detalhes</a></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-slate-500">Total: {{ page().totalElements }}</p>
            <div class="flex gap-2">
              <button type="button" class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold" [disabled]="page().number === 0" (click)="loadPage(page().number - 1)">Anterior</button>
              <button type="button" class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold" [disabled]="page().number + 1 >= page().totalPages" (click)="loadPage(page().number + 1)">Próxima</button>
            </div>
          </div>
        }
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900">Novo cliente</h3>

        <form class="mt-5 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-slate-700">Nome</span>
            <input class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-sky-300 focus:ring-4" type="text" formControlName="name" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-slate-700">Telefone</span>
            <input class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-sky-300 focus:ring-4" type="text" formControlName="phone" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-slate-700">Email</span>
            <input class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-sky-300 focus:ring-4" type="email" formControlName="email" />
          </label>

          <div class="space-y-2 text-sm text-rose-700">
            @if (showError('name')) { <p>{{ showError('name') }}</p> }
            @if (showError('phone')) { <p>{{ showError('phone') }}</p> }
            @if (showError('email')) { <p>{{ showError('email') }}</p> }
          </div>

          <button type="submit" class="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700" [disabled]="submitting()">
            {{ submitting() ? 'Salvando...' : 'Cadastrar cliente' }}
          </button>
        </form>
      </div>
    </section>
  `
})
export class ClientsPageComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly feedback = inject(FeedbackService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly page = signal<ApiPage<Client>>({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 });
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    this.loadPage(0);
  }

  protected loadPage(pageNumber: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.clientService
      .list(pageNumber, 10)
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (page) => this.page.set(page), error: () => this.error.set('Não foi possível carregar os clientes.') });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: ClientDTO = this.form.getRawValue();
    this.submitting.set(true);

    this.clientService
      .create(payload)
      .pipe(finalize(() => this.submitting.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.feedback.showSuccess('Cliente cadastrado com sucesso.');
        this.form.reset();
        this.loadPage(0);
      });
  }

  protected showError(controlName: 'name' | 'phone' | 'email'): string | null {
    const control = this.form.controls[controlName];
    if (!control.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'Campo obrigatório.';
    }

    if (control.errors['minlength']) {
      return 'O telefone deve ter ao menos 8 caracteres.';
    }

    if (control.errors['maxlength']) {
      return 'O telefone deve ter no máximo 15 caracteres.';
    }

    if (control.errors['email']) {
      return 'Informe um email válido.';
    }

    return null;
  }

  protected formatDateTime(value: string): string {
    return formatLocalDateTime(value);
  }
}
