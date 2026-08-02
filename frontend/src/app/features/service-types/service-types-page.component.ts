import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FeedbackService } from '../../core/services/feedback.service';
import { ServiceTypeService } from '../../core/services/service-type.service';
import { ApiPage } from '../../shared/models/api-page.model';
import { ServiceType } from '../../shared/models/service-type.model';
import { VehicleSize, vehicleSizeLabels, vehicleSizes } from '../../shared/models/vehicle-size.model';

@Component({
  standalone: true,
  selector: 'app-service-types-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="rounded-2xl bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.32em] text-sky-700">Tipos de serviço</p>
          <h2 class="mt-1 text-3xl font-black text-slate-900">Tabela de preços</h2>
          <p class="mt-2 text-sm text-slate-500">Edite o preço de cada serviço conforme o porte do veículo.</p>
        </div>
        <button type="button" class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold" (click)="loadPage(page().number)">Recarregar</button>
      </div>

      @if (loading()) {
        <p class="mt-6 text-sm text-slate-500">Carregando tipos de serviço...</p>
      } @else if (error()) {
        <div class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p>{{ error() }}</p>
          <button type="button" class="mt-2 font-semibold underline" (click)="loadPage(page().number)">Tentar novamente</button>
        </div>
      } @else if (page().content.length === 0) {
        <p class="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Nenhum tipo de serviço encontrado.</p>
      } @else {
        <div class="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="px-4 py-3 font-semibold">Serviço</th>
                @for (size of sizes; track size) {
                  <th class="px-4 py-3 font-semibold">{{ sizeLabel(size) }}</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              @for (serviceType of page().content; track serviceType.id) {
                <tr>
                  <td class="whitespace-nowrap px-4 py-3 font-semibold">
                    <a class="text-sky-700" [routerLink]="[serviceType.id]">{{ serviceType.name }}</a>
                  </td>
                  @for (size of sizes; track size) {
                    <td class="min-w-44 px-4 py-3">
                      @if (isEditing(serviceType.id, size)) {
                        <div class="flex items-center gap-2">
                          <input class="w-24 rounded-xl border border-slate-300 px-3 py-2" type="number" min="0" step="0.01" [formControl]="priceControl" />
                          <button type="button" class="rounded-full bg-slate-900 px-3 py-2 font-semibold text-white" [disabled]="saving() || priceControl.invalid" (click)="savePrice(serviceType, size)">Salvar</button>
                          <button type="button" class="rounded-full border border-slate-200 px-3 py-2 font-semibold" [disabled]="saving()" (click)="cancelEdit()">Cancelar</button>
                        </div>
                      } @else if (priceFor(serviceType, size) !== null) {
                        <button type="button" class="group inline-flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-50" (click)="startEdit(serviceType, size)">
                          <span>{{ currency(priceFor(serviceType, size)!) }}</span>
                          <span class="text-xs font-semibold text-sky-700 opacity-0 transition group-hover:opacity-100">Editar</span>
                        </button>
                      } @else {
                        <span class="text-slate-400">Não configurado</span>
                      }
                    </td>
                  }
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
    </section>
  `
})
export class ServiceTypesPageComponent implements OnInit {
  private readonly serviceTypeService = inject(ServiceTypeService);
  private readonly feedback = inject(FeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly sizes = vehicleSizes;
  protected readonly page = signal<ApiPage<ServiceType>>({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 });
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly editing = signal<{ serviceTypeId: number; vehicleSize: VehicleSize } | null>(null);
  protected readonly priceControl = new FormControl<number | null>(null, [Validators.required, Validators.min(0)]);

  ngOnInit(): void {
    this.loadPage(0);
  }

  protected loadPage(pageNumber: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.serviceTypeService.list(pageNumber, 10)
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => this.page.set(page),
        error: () => this.error.set('Não foi possível carregar os tipos de serviço.')
      });
  }

  protected priceFor(serviceType: ServiceType, vehicleSize: VehicleSize): number | null {
    return serviceType.prices.find((price) => price.vehicleSize === vehicleSize)?.price ?? null;
  }

  protected startEdit(serviceType: ServiceType, vehicleSize: VehicleSize): void {
    const price = this.priceFor(serviceType, vehicleSize);
    if (price === null) return;
    this.editing.set({ serviceTypeId: serviceType.id, vehicleSize });
    this.priceControl.setValue(price);
  }

  protected isEditing(serviceTypeId: number, vehicleSize: VehicleSize): boolean {
    const editing = this.editing();
    return editing?.serviceTypeId === serviceTypeId && editing.vehicleSize === vehicleSize;
  }

  protected cancelEdit(): void {
    this.editing.set(null);
    this.priceControl.reset();
  }

  protected savePrice(serviceType: ServiceType, vehicleSize: VehicleSize): void {
    if (this.priceControl.invalid || this.priceControl.value === null) return;
    this.saving.set(true);
    this.serviceTypeService.updatePrice(serviceType.id, vehicleSize, this.priceControl.value)
      .pipe(finalize(() => this.saving.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => {
        const content = this.page().content.map((item) => item.id !== serviceType.id ? item : {
          ...item,
          prices: item.prices.map((price) => price.vehicleSize === vehicleSize ? updated : price)
        });
        this.page.update((page) => ({ ...page, content }));
        this.feedback.showSuccess('Preço atualizado.');
        this.cancelEdit();
      });
  }

  protected sizeLabel(size: VehicleSize): string {
    return vehicleSizeLabels[size];
  }

  protected currency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}
