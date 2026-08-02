import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AppointmentService } from '../../core/services/appointment.service';
import { ClientService } from '../../core/services/client';
import { FeedbackService } from '../../core/services/feedback.service';
import { ServiceTypeService } from '../../core/services/service-type.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { ApiPage } from '../../shared/models/api-page.model';
import { Appointment } from '../../shared/models/appointment.model';
import { AppointmentStatus, appointmentStatusLabels } from '../../shared/models/appointment-status.model';
import { AppointmentDTO } from '../../shared/models/appointment-dto.model';
import { Client } from '../../shared/models/client.model';
import { ServiceType } from '../../shared/models/service-type.model';
import { Vehicle } from '../../shared/models/vehicle.model';
import { composeLocalDateTime, formatLocalDateTime, toDateInputValue, toTimeInputValue, todayIsoDate } from '../../shared/utils/date-time';

@Component({
  standalone: true,
  selector: 'app-appointments-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="space-y-6">
      <div class="rounded-2xl bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-sky-700">Agendamentos</p>
            <h2 class="mt-1 text-3xl font-black text-slate-900">Tela principal do sistema</h2>
          </div>
          <button type="button" class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold" (click)="loadPage(filtersForm.getRawValue().page ?? 0)">Recarregar</button>
        </div>

        <form class="mt-6 grid gap-4 lg:grid-cols-4" [formGroup]="filtersForm" (ngSubmit)="applyFilters()">
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-slate-700">Status</span>
            <select class="w-full rounded-2xl border border-slate-300 px-4 py-3" formControlName="status">
              <option [ngValue]="null">Todos</option>
              @for (status of statuses; track status) {
                <option [ngValue]="status">{{ label(status) }}</option>
              }
            </select>
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-slate-700">Data</span>
            <input class="w-full rounded-2xl border border-slate-300 px-4 py-3" type="date" formControlName="date" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-slate-700">Cliente</span>
            <select class="w-full rounded-2xl border border-slate-300 px-4 py-3" formControlName="clientId">
              <option [ngValue]="null">Todos</option>
              @for (client of clients(); track client.id) {
                <option [ngValue]="client.id">{{ client.name }}</option>
              }
            </select>
          </label>
          <div class="flex items-end gap-3">
            <button type="submit" class="w-full rounded-full bg-slate-900 px-4 py-3 font-semibold text-white">Filtrar</button>
            <button type="button" class="w-full rounded-full border border-slate-200 px-4 py-3 font-semibold" (click)="resetFilters()">Limpar</button>
          </div>
        </form>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <h3 class="text-lg font-bold text-slate-900">Listagem</h3>
            <span class="text-sm text-slate-500">{{ page().totalElements }} registro(s)</span>
          </div>

          @if (loading()) {
            <p class="mt-6 text-sm text-slate-500">Carregando agendamentos...</p>
          } @else if (error()) {
            <div class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><p>{{ error() }}</p><button type="button" class="mt-2 font-semibold underline" (click)="loadPage(page().number)">Tentar novamente</button></div>
          } @else if (page().content.length === 0) {
            <p class="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Nenhum agendamento encontrado.</p>
          } @else {
            <div class="mt-6 space-y-3">
              @for (appointment of page().content; track appointment.id) {
                <article class="rounded-2xl bg-slate-50 p-5 shadow-sm">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div class="flex flex-wrap items-center gap-2">
                        <a [routerLink]="[appointment.id]" class="text-lg font-bold text-sky-700">{{ appointment.client.name }}</a>
                        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">{{ label(appointment.status) }}</span>
                      </div>
                      <p class="mt-1 text-sm text-slate-500">{{ formatDateTime(appointment.scheduledDateTime) }} · {{ appointment.vehicle.brand }} {{ appointment.vehicle.model }} · {{ appointment.serviceType.name }}</p>
                      <p class="mt-1 text-sm font-semibold text-slate-700">{{ currency(appointment.priceAtBooking) }}</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <button type="button" class="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold" (click)="edit(appointment)">Editar</button>
                      @if (appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED') {
                        @if (appointment.status === 'PENDING') {
                          <button type="button" class="rounded-full border border-emerald-200 px-3 py-1.5 text-sm font-semibold text-emerald-700" (click)="changeStatus(appointment.id, 'CONFIRMED')">Confirmar</button>
                        }
                        @if (appointment.status === 'CONFIRMED') {
                          <button type="button" class="rounded-full border border-emerald-200 px-3 py-1.5 text-sm font-semibold text-emerald-700" (click)="changeStatus(appointment.id, 'COMPLETED')">Concluir</button>
                        }
                        <button type="button" class="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-700" (click)="changeStatus(appointment.id, 'CANCELLED')">Cancelar</button>
                      }
                      <button type="button" class="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-700" (click)="remove(appointment.id)">Excluir</button>
                    </div>
                  </div>
                </article>
              }
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <span>Página {{ page().number + 1 }} de {{ page().totalPages || 1 }}</span>
              <div class="flex gap-2">
                <button type="button" class="rounded-full border border-slate-200 px-4 py-2 font-semibold" [disabled]="page().number === 0" (click)="loadPage(page().number - 1)">Anterior</button>
                <button type="button" class="rounded-full border border-slate-200 px-4 py-2 font-semibold" [disabled]="page().number + 1 >= page().totalPages" (click)="loadPage(page().number + 1)">Próxima</button>
              </div>
            </div>
          }
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-lg font-bold text-slate-900">{{ editingId() ? 'Editar agendamento' : 'Novo agendamento' }}</h3>
            @if (editingId()) {
              <button type="button" class="text-sm font-semibold text-slate-500" (click)="resetForm()">Cancelar edição</button>
            }
          </div>

          <form class="mt-5 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
            <label class="block">
              <span class="mb-1 block text-sm font-semibold text-slate-700">Cliente</span>
              <select class="w-full rounded-2xl border border-slate-300 px-4 py-3" formControlName="clientId">
                <option [ngValue]="null">Selecione</option>
                @for (client of clients(); track client.id) {
                  <option [ngValue]="client.id">{{ client.name }}</option>
                }
              </select>
            </label>
            <label class="block">
              <span class="mb-1 block text-sm font-semibold text-slate-700">Veículo</span>
              <select class="w-full rounded-2xl border border-slate-300 px-4 py-3" formControlName="vehicleId">
                <option [ngValue]="null">Selecione</option>
                @for (vehicle of vehicles(); track vehicle.id) {
                  <option [ngValue]="vehicle.id">{{ vehicle.brand }} {{ vehicle.model }} - {{ vehicle.licensePlate }}</option>
                }
              </select>
            </label>
            <label class="block">
              <span class="mb-1 block text-sm font-semibold text-slate-700">Tipo de serviço</span>
              <select class="w-full rounded-2xl border border-slate-300 px-4 py-3" formControlName="serviceTypeId">
                <option [ngValue]="null">Selecione</option>
                @for (serviceType of serviceTypes(); track serviceType.id) {
                  <option [ngValue]="serviceType.id">{{ serviceType.name }}</option>
                }
              </select>
            </label>
            @if (calculatedPrice() !== null) {
              <div class="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                <span class="font-semibold">Preço previsto:</span> {{ currency(calculatedPrice()!) }}
                <p class="mt-1 text-xs text-sky-700">O valor definitivo será calculado pelo sistema ao salvar.</p>
              </div>
            }
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="mb-1 block text-sm font-semibold text-slate-700">Data</span>
                <input class="w-full rounded-2xl border border-slate-300 px-4 py-3" type="date" formControlName="scheduledDate" />
              </label>
              <label class="block">
                <span class="mb-1 block text-sm font-semibold text-slate-700">Horário</span>
                <select class="w-full rounded-2xl border border-slate-300 px-4 py-3" formControlName="scheduledTime">
                  <option [ngValue]="null">Selecione</option>
                  @for (slot of availableSlots(); track slot) {
                    <option [ngValue]="slot">{{ slot }}</option>
                  }
                </select>
              </label>
            </div>

            <div class="space-y-2 text-sm text-rose-700">
              @if (showError('clientId')) { <p>{{ showError('clientId') }}</p> }
              @if (showError('vehicleId')) { <p>{{ showError('vehicleId') }}</p> }
              @if (showError('serviceTypeId')) { <p>{{ showError('serviceTypeId') }}</p> }
              @if (showError('scheduledDate')) { <p>{{ showError('scheduledDate') }}</p> }
              @if (showError('scheduledTime')) { <p>{{ showError('scheduledTime') }}</p> }
            </div>

            <button type="submit" class="w-full rounded-full bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700" [disabled]="submitting()">
              {{ submitting() ? 'Salvando...' : (editingId() ? 'Atualizar agendamento' : 'Criar agendamento') }}
            </button>
          </form>

          <div class="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <p class="font-semibold text-slate-800">Horários livres</p>
            <p class="mt-1">Os slots são carregados em intervalos de 30 minutos entre 08:00 e 18:00.</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AppointmentsPageComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly clientService = inject(ClientService);
  private readonly vehicleService = inject(VehicleService);
  private readonly serviceTypeService = inject(ServiceTypeService);
  private readonly feedback = inject(FeedbackService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly statuses: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  protected readonly page = signal<ApiPage<Appointment>>({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 });
  protected readonly clients = signal<Client[]>([]);
  protected readonly vehicles = signal<Vehicle[]>([]);
  protected readonly serviceTypes = signal<ServiceType[]>([]);
  protected readonly availableSlots = signal<string[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly filtersForm = this.fb.group({
    status: this.fb.control<AppointmentStatus | null>(null),
    date: this.fb.control(todayIsoDate()),
    clientId: this.fb.control<number | null>(null),
    page: this.fb.control(0)
  });
  protected readonly form = this.fb.group({
    clientId: this.fb.control<number | null>(null, Validators.required),
    vehicleId: this.fb.control<number | null>(null, Validators.required),
    serviceTypeId: this.fb.control<number | null>(null, Validators.required),
    scheduledDate: this.fb.nonNullable.control(todayIsoDate(), Validators.required),
    scheduledTime: this.fb.control<string | null>(null, Validators.required)
  });

  ngOnInit(): void {
    this.clientService.list(0, 200).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((page) => this.clients.set(page.content));
    this.serviceTypeService.list(0, 200).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((page) => this.serviceTypes.set(page.content));
    this.loadPage(0);

    this.form.controls.clientId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((clientId) => {
      this.form.controls.vehicleId.setValue(null);
      this.vehicles.set([]);

      if (clientId) {
        this.vehicleService.list(0, 200).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((page) => {
          this.vehicles.set(page.content.filter((vehicle) => vehicle.client.id === clientId));
        });
      }
    });

    this.form.controls.scheduledDate.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((dateValue) => {
      if (dateValue) {
        this.loadAvailability(dateValue);
      }
    });
  }

  protected loadPage(pageNumber: number): void {
    this.filtersForm.controls.page.setValue(pageNumber, { emitEvent: false });
    this.loading.set(true);
    this.error.set(null);
    const filters = this.filtersForm.getRawValue();
    this.appointmentService
      .list({ status: filters.status, date: filters.date, clientId: filters.clientId, page: pageNumber, size: 10 })
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => this.page.set(page),
        error: () => this.error.set('Não foi possível carregar os agendamentos.')
      });
  }

  protected applyFilters(): void {
    this.loadPage(0);
  }

  protected resetFilters(): void {
    this.filtersForm.reset({ status: null, date: todayIsoDate(), clientId: null, page: 0 });
    this.loadPage(0);
  }

  protected edit(appointment: Appointment): void {
    this.editingId.set(appointment.id);
    const date = toDateInputValue(appointment.scheduledDateTime);
    const time = toTimeInputValue(appointment.scheduledDateTime);

    this.form.patchValue({
      clientId: appointment.client.id,
      serviceTypeId: appointment.serviceType.id,
      scheduledDate: date,
      scheduledTime: time
    }, { emitEvent: false });

    this.vehicleService.list(0, 200).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((page) => {
      this.vehicles.set(page.content.filter((vehicle) => vehicle.client.id === appointment.client.id));
      this.form.controls.vehicleId.setValue(appointment.vehicle.id, { emitEvent: false });
    });

    this.loadAvailability(date, time);
  }

  protected resetForm(): void {
    this.editingId.set(null);
    this.form.reset({ clientId: null, vehicleId: null, serviceTypeId: null, scheduledDate: todayIsoDate(), scheduledTime: null });
    this.availableSlots.set([]);
    this.vehicles.set([]);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: AppointmentDTO = {
      clientId: value.clientId as number,
      vehicleId: value.vehicleId as number,
      serviceTypeId: value.serviceTypeId as number,
      scheduledDateTime: composeLocalDateTime(value.scheduledDate, value.scheduledTime as string)
    };

    this.submitting.set(true);
    const request = this.editingId()
      ? this.appointmentService.update(this.editingId() as number, payload)
      : this.appointmentService.create(payload);

    request.pipe(finalize(() => this.submitting.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.feedback.showSuccess(this.editingId() ? 'Agendamento atualizado.' : 'Agendamento criado.');
      this.resetForm();
      this.loadPage(this.page().number);
    });
  }

  protected changeStatus(id: number, status: AppointmentStatus): void {
    this.appointmentService.updateStatus(id, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.feedback.showSuccess(`Status alterado para ${appointmentStatusLabels[status]}.`);
      this.loadPage(this.page().number);
    });
  }

  protected remove(id: number): void {
    if (!window.confirm('Excluir este agendamento?')) {
      return;
    }

    this.appointmentService.delete(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.feedback.showSuccess('Agendamento excluído.');
      this.loadPage(this.page().number);
    });
  }

  protected loadAvailability(dateValue: string, keepTime?: string): void {
    this.appointmentService.availability(dateValue).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((slots) => {
      const normalizedSlots = keepTime && !slots.includes(keepTime) ? [keepTime, ...slots] : slots;
      this.availableSlots.set(normalizedSlots);

      if (keepTime && normalizedSlots.includes(keepTime)) {
        this.form.controls.scheduledTime.setValue(keepTime);
      }
    });
  }

  protected label(status: AppointmentStatus): string {
    return appointmentStatusLabels[status];
  }

  protected showError(controlName: 'clientId' | 'vehicleId' | 'serviceTypeId' | 'scheduledDate' | 'scheduledTime'): string | null {
    const control = this.form.controls[controlName];
    if (!control.touched || !control.errors) {
      return null;
    }

    return 'Campo obrigatório.';
  }

  protected formatDateTime(value: string): string {
    return formatLocalDateTime(value);
  }

  protected calculatedPrice(): number | null {
    const vehicleId = this.form.controls.vehicleId.value;
    const serviceTypeId = this.form.controls.serviceTypeId.value;
    const vehicle = this.vehicles().find((item) => item.id === vehicleId);
    const serviceType = this.serviceTypes().find((item) => item.id === serviceTypeId);
    if (!vehicle || !serviceType) return null;
    return serviceType.prices.find((price) => price.vehicleSize === vehicle.size)?.price ?? null;
  }

  protected currency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}
