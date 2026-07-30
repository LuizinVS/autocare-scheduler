import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ClientService } from '../../core/services/client';
import { FeedbackService } from '../../core/services/feedback.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { ApiPage } from '../../shared/models/api-page.model';
import { Client } from '../../shared/models/client.model';
import { Vehicle } from '../../shared/models/vehicle.model';
import { VehicleDTO } from '../../shared/models/vehicle-dto.model';

@Component({
  standalone: true,
  selector: 'app-vehicles-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-sky-700">Veículos</p>
            <h2 class="mt-1 text-3xl font-black text-slate-900">Listagem paginada</h2>
          </div>
          <button type="button" class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700" (click)="loadPage(page().number)">Recarregar</button>
        </div>

        @if (loading()) {
          <p class="mt-6 text-sm text-slate-500">Carregando veículos...</p>
        } @else if (error()) {
          <div class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><p>{{ error() }}</p><button type="button" class="mt-2 font-semibold underline" (click)="loadPage(page().number)">Tentar novamente</button></div>
        } @else if (page().content.length === 0) {
          <p class="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Nenhum veículo encontrado.</p>
        } @else {
          <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr>
                  <th class="px-4 py-3 font-semibold">Veículo</th>
                  <th class="px-4 py-3 font-semibold">Cliente</th>
                  <th class="px-4 py-3 font-semibold">Placa</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                @for (vehicle of page().content; track vehicle.id) {
                  <tr>
                    <td class="px-4 py-3 font-medium"><a class="text-sky-700" [routerLink]="[vehicle.id]">{{ vehicle.brand }} {{ vehicle.model }}</a></td>
                    <td class="px-4 py-3 text-slate-600">{{ vehicle.client.name }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ vehicle.licensePlate }}</td>
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
        <h3 class="text-lg font-bold text-slate-900">Novo veículo</h3>

        <form class="mt-5 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-slate-700">Cliente</span>
            <select class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-sky-300 focus:ring-4" formControlName="clientId">
              <option [ngValue]="null">Selecione</option>
              @for (client of clients(); track client.id) {
                <option [ngValue]="client.id">{{ client.name }}</option>
              }
            </select>
          </label>
          <label class="block"><span class="mb-1 block text-sm font-semibold text-slate-700">Marca</span><input class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-sky-300 focus:ring-4" formControlName="brand" /></label>
          <label class="block"><span class="mb-1 block text-sm font-semibold text-slate-700">Modelo</span><input class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-sky-300 focus:ring-4" formControlName="model" /></label>
          <label class="block"><span class="mb-1 block text-sm font-semibold text-slate-700">Placa</span><input class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-sky-300 focus:ring-4" formControlName="licensePlate" /></label>

          <div class="space-y-2 text-sm text-rose-700">
            @if (showError('clientId')) { <p>{{ showError('clientId') }}</p> }
            @if (showError('brand')) { <p>{{ showError('brand') }}</p> }
            @if (showError('model')) { <p>{{ showError('model') }}</p> }
            @if (showError('licensePlate')) { <p>{{ showError('licensePlate') }}</p> }
          </div>

          <button type="submit" class="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700" [disabled]="submitting()">
            {{ submitting() ? 'Salvando...' : 'Cadastrar veículo' }}
          </button>
        </form>
      </div>
    </section>
  `
})
export class VehiclesPageComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);
  private readonly clientService = inject(ClientService);
  private readonly feedback = inject(FeedbackService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly page = signal<ApiPage<Vehicle>>({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 });
  protected readonly clients = signal<Client[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly form = this.fb.group({
    clientId: this.fb.control<number | null>(null, Validators.required),
    brand: this.fb.nonNullable.control('', Validators.required),
    model: this.fb.nonNullable.control('', Validators.required),
    licensePlate: this.fb.nonNullable.control('', Validators.required)
  });

  ngOnInit(): void {
    this.loadPage(0);
    this.clientService.list(0, 200).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((page) => this.clients.set(page.content));
  }

  protected loadPage(pageNumber: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.vehicleService
      .list(pageNumber, 10)
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (page) => this.page.set(page), error: () => this.error.set('Não foi possível carregar os veículos.') });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: VehicleDTO = {
      clientId: value.clientId as number,
      brand: value.brand,
      model: value.model,
      licensePlate: value.licensePlate
    };

    this.submitting.set(true);
    this.vehicleService
      .create(payload)
      .pipe(finalize(() => this.submitting.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.feedback.showSuccess('Veículo cadastrado com sucesso.');
        this.form.reset();
        this.loadPage(0);
      });
  }

  protected showError(controlName: 'clientId' | 'brand' | 'model' | 'licensePlate'): string | null {
    const control = this.form.controls[controlName];
    if (!control.touched || !control.errors) {
      return null;
    }

    return 'Campo obrigatório.';
  }
}
