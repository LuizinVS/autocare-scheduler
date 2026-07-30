import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FeedbackService } from '../../core/services/feedback.service';
import { ServiceTypeService } from '../../core/services/service-type.service';
import { ApiPage } from '../../shared/models/api-page.model';
import { ServiceType } from '../../shared/models/service-type.model';
import { ServiceTypeDTO } from '../../shared/models/service-type-dto.model';
import { formatLocalDateTime } from '../../shared/utils/date-time';

@Component({
  standalone: true,
  selector: 'app-service-types-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="grid gap-6 xl:grid-cols-[1.2fr_0.95fr]">
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-sky-700">Tipos de serviço</p>
            <h2 class="mt-1 text-3xl font-black text-slate-900">CRUD completo</h2>
          </div>
          <button type="button" class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold" (click)="loadPage(page().number)">Recarregar</button>
        </div>

        @if (loading()) {
          <p class="mt-6 text-sm text-slate-500">Carregando tipos de serviço...</p>
        } @else if (error()) {
          <div class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><p>{{ error() }}</p><button type="button" class="mt-2 font-semibold underline" (click)="loadPage(page().number)">Tentar novamente</button></div>
        } @else if (page().content.length === 0) {
          <p class="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Nenhum tipo de serviço encontrado.</p>
        } @else {
          <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr>
                  <th class="px-4 py-3 font-semibold">Nome</th>
                  <th class="px-4 py-3 font-semibold">Preço</th>
                  <th class="px-4 py-3 font-semibold">Criado em</th>
                  <th class="px-4 py-3 font-semibold text-right"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                @for (serviceType of page().content; track serviceType.id) {
                  <tr>
                    <td class="px-4 py-3 font-medium"><a class="text-sky-700" [routerLink]="[serviceType.id]">{{ serviceType.name }}</a></td>
                    <td class="px-4 py-3 text-slate-600">R$ {{ serviceType.price.toFixed(2) }}</td>
                    <td class="px-4 py-3 text-slate-500">{{ formatDateTime(serviceType.createdAt) }}</td>
                    <td class="px-4 py-3 text-right">
                      <div class="inline-flex gap-2">
                        <button type="button" class="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold" (click)="edit(serviceType)">Editar</button>
                        <button type="button" class="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-700" (click)="remove(serviceType.id)">Excluir</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500">
            <span>Total: {{ page().totalElements }}</span>
            <div class="flex gap-2">
              <button type="button" class="rounded-full border border-slate-200 px-4 py-2 font-semibold" [disabled]="page().number === 0" (click)="loadPage(page().number - 1)">Anterior</button>
              <button type="button" class="rounded-full border border-slate-200 px-4 py-2 font-semibold" [disabled]="page().number + 1 >= page().totalPages" (click)="loadPage(page().number + 1)">Próxima</button>
            </div>
          </div>
        }
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900">{{ editingId() ? 'Editar tipo' : 'Novo tipo de serviço' }}</h3>

        <form class="mt-5 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <label class="block"><span class="mb-1 block text-sm font-semibold text-slate-700">Nome</span><input class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-sky-300 focus:ring-4" formControlName="name" /></label>
          <label class="block"><span class="mb-1 block text-sm font-semibold text-slate-700">Preço</span><input class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-sky-300 focus:ring-4" type="number" step="0.01" formControlName="price" /></label>

          <div class="space-y-2 text-sm text-rose-700">
            @if (showError('name')) { <p>{{ showError('name') }}</p> }
            @if (showError('price')) { <p>{{ showError('price') }}</p> }
          </div>

          <div class="flex gap-3">
            <button type="submit" class="flex-1 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700" [disabled]="submitting()">
              {{ submitting() ? 'Salvando...' : (editingId() ? 'Atualizar' : 'Cadastrar') }}
            </button>
            @if (editingId()) {
              <button type="button" class="rounded-2xl border border-slate-200 px-4 py-3 font-semibold" (click)="reset()">Cancelar</button>
            }
          </div>
        </form>
      </div>
    </section>
  `
})
export class ServiceTypesPageComponent implements OnInit {
  private readonly serviceTypeService = inject(ServiceTypeService);
  private readonly feedback = inject(FeedbackService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly page = signal<ApiPage<ServiceType>>({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 });
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    price: this.fb.control<number | null>(null, Validators.required)
  });

  ngOnInit(): void {
    this.loadPage(0);
  }

  protected loadPage(pageNumber: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.serviceTypeService
      .list(pageNumber, 10)
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (page) => this.page.set(page), error: () => this.error.set('Não foi possível carregar os tipos de serviço.') });
  }

  protected edit(serviceType: ServiceType): void {
    this.editingId.set(serviceType.id);
    this.form.patchValue({
      name: serviceType.name,
      price: serviceType.price
    });
  }

  protected reset(): void {
    this.editingId.set(null);
    this.form.reset();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: ServiceTypeDTO = { name: value.name, price: Number(value.price) };
    this.submitting.set(true);

    const request = this.editingId()
      ? this.serviceTypeService.update(this.editingId() as number, payload)
      : this.serviceTypeService.create(payload);

    request.pipe(finalize(() => this.submitting.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.feedback.showSuccess(this.editingId() ? 'Tipo de serviço atualizado.' : 'Tipo de serviço cadastrado.');
      this.reset();
      this.loadPage(0);
    });
  }

  protected remove(id: number): void {
    if (!window.confirm('Excluir este tipo de serviço?')) {
      return;
    }

    this.serviceTypeService.delete(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.feedback.showSuccess('Tipo de serviço excluído.');
      this.loadPage(this.page().number);
    });
  }

  protected showError(controlName: 'name' | 'price'): string | null {
    const control = this.form.controls[controlName];
    if (!control.touched || !control.errors) {
      return null;
    }

    return 'Campo obrigatório.';
  }

  protected formatDateTime(value: string): string {
    return formatLocalDateTime(value);
  }
}
