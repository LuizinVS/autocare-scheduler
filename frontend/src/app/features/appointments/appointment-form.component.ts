import { Component, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AppointmentService } from '../../core/services/appointment.service';
import { ClientService } from '../../core/services/client';
import { ServiceTypeService } from '../../core/services/service-type.service';
import { Appointment } from '../../shared/models/appointment.model';
import { AppointmentDTO } from '../../shared/models/appointment-dto.model';
import { Client } from '../../shared/models/client.model';
import { ServiceType } from '../../shared/models/service-type.model';
import { Vehicle } from '../../shared/models/vehicle.model';
import { composeLocalDateTime, toDateInputValue, toTimeInputValue, todayIsoDate } from '../../shared/utils/date-time';

export interface AppointmentSavedEvent {
  appointment: Appointment;
  edited: boolean;
}

@Component({
  standalone: true,
  selector: 'app-appointment-form',
  imports: [ReactiveFormsModule],
  template: `
    <div class="rounded-2xl bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-bold text-slate-900">{{ editingId() ? 'Editar agendamento' : 'Novo agendamento' }}</h3>
        @if (editingId()) {
          <button type="button" class="text-sm font-semibold text-slate-500" (click)="reset()">Cancelar edição</button>
        }
      </div>

      <form class="mt-5 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
        @if (clientId() === null) {
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-slate-700">Cliente</span>
            <select class="w-full rounded-2xl border border-slate-300 px-4 py-3" formControlName="clientId">
              <option [ngValue]="null">Selecione</option>
              @for (client of clients(); track client.id) {
                <option [ngValue]="client.id">{{ client.name }}</option>
              }
            </select>
          </label>
        }

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

        @if (form.invalid && formSubmitted()) {
          <p class="text-sm text-rose-700">Preencha todos os campos obrigatórios.</p>
        }

        <button type="submit" class="w-full rounded-full bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700" [disabled]="submitting()">
          {{ submitting() ? 'Salvando...' : (editingId() ? 'Atualizar agendamento' : 'Criar agendamento') }}
        </button>
      </form>

      <div class="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
        <p class="font-semibold text-slate-800">Horários livres</p>
        <p class="mt-1">Os slots são carregados em intervalos de 30 minutos entre 08:00 e 18:00.</p>
      </div>
    </div>
  `
})
export class AppointmentFormComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly clientService = inject(ClientService);
  private readonly serviceTypeService = inject(ServiceTypeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly clientId = input<number | null>(null);
  readonly appointmentSaved = output<AppointmentSavedEvent>();

  protected readonly clients = signal<Client[]>([]);
  protected readonly vehicles = signal<Vehicle[]>([]);
  protected readonly serviceTypes = signal<ServiceType[]>([]);
  protected readonly availableSlots = signal<string[]>([]);
  protected readonly submitting = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly form = this.fb.group({
    clientId: this.fb.control<number | null>(null, Validators.required),
    vehicleId: this.fb.control<number | null>(null, Validators.required),
    serviceTypeId: this.fb.control<number | null>(null, Validators.required),
    scheduledDate: this.fb.nonNullable.control(todayIsoDate(), Validators.required),
    scheduledTime: this.fb.control<string | null>(null, Validators.required)
  });

  ngOnInit(): void {
    this.serviceTypeService.list(0, 200).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((page) => this.serviceTypes.set(page.content));

    if (this.clientId() === null) {
      this.clientService.list(0, 200).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((page) => this.clients.set(page.content));
    } else {
      this.form.controls.clientId.setValue(this.clientId(), { emitEvent: false });
      this.loadVehicles(this.clientId() as number);
    }

    this.loadAvailability(this.form.controls.scheduledDate.value);
    this.form.controls.clientId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((id) => {
      this.form.controls.vehicleId.setValue(null);
      this.vehicles.set([]);
      if (id) this.loadVehicles(id);
    });
    this.form.controls.scheduledDate.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((date) => {
      if (date) this.loadAvailability(date);
    });
  }

  edit(appointment: Appointment): void {
    this.formSubmitted.set(false);
    this.editingId.set(appointment.id);
    const date = toDateInputValue(appointment.scheduledDateTime);
    const time = toTimeInputValue(appointment.scheduledDateTime);
    this.form.patchValue({
      clientId: appointment.client.id,
      serviceTypeId: appointment.serviceType.id,
      scheduledDate: date,
      scheduledTime: time
    }, { emitEvent: false });
    this.loadVehicles(appointment.client.id, appointment.vehicle.id);
    this.loadAvailability(date, time);
  }

  reset(): void {
    this.formSubmitted.set(false);
    this.editingId.set(null);
    this.form.reset({ clientId: this.clientId(), vehicleId: null, serviceTypeId: null, scheduledDate: todayIsoDate(), scheduledTime: null });
    this.availableSlots.set([]);
    if (this.clientId() === null) this.vehicles.set([]);
    else this.loadVehicles(this.clientId() as number);
    this.loadAvailability(todayIsoDate());
  }

  protected submit(): void {
    this.formSubmitted.set(true);
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
    const edited = this.editingId() !== null;
    const request = edited
      ? this.appointmentService.update(this.editingId() as number, payload)
      : this.appointmentService.create(payload);

    this.submitting.set(true);
    request.pipe(finalize(() => this.submitting.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe((appointment) => {
      this.reset();
      this.appointmentSaved.emit({ appointment, edited });
    });
  }

  protected calculatedPrice(): number | null {
    const vehicle = this.vehicles().find((item) => item.id === this.form.controls.vehicleId.value);
    const serviceType = this.serviceTypes().find((item) => item.id === this.form.controls.serviceTypeId.value);
    if (!vehicle || !serviceType) return null;
    return serviceType.prices.find((price) => price.vehicleSize === vehicle.size)?.price ?? null;
  }

  protected currency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  private loadVehicles(clientId: number, selectedVehicleId?: number): void {
    this.clientService.getVehicles(clientId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((vehicles) => {
      this.vehicles.set(vehicles);
      if (selectedVehicleId) this.form.controls.vehicleId.setValue(selectedVehicleId, { emitEvent: false });
    });
  }

  private loadAvailability(date: string, keepTime?: string): void {
    this.appointmentService.availability(date).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((slots) => {
      const normalizedSlots = keepTime && !slots.includes(keepTime) ? [keepTime, ...slots] : slots;
      this.availableSlots.set(normalizedSlots);
      if (keepTime) this.form.controls.scheduledTime.setValue(keepTime, { emitEvent: false });
    });
  }
}
