import { Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AppointmentService } from '../../core/services/appointment.service';
import { ClientService } from '../../core/services/client';
import { FeedbackService } from '../../core/services/feedback.service';
import { ApiPage } from '../../shared/models/api-page.model';
import { Appointment } from '../../shared/models/appointment.model';
import { AppointmentStatus, appointmentStatusLabels } from '../../shared/models/appointment-status.model';
import { Client } from '../../shared/models/client.model';
import { formatLocalDateTime, todayIsoDate } from '../../shared/utils/date-time';
import { AppointmentFormComponent, AppointmentSavedEvent } from './appointment-form.component';

@Component({
  standalone: true,
  selector: 'app-appointments-page',
  imports: [AppointmentFormComponent, ReactiveFormsModule, RouterLink],
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
              @for (status of statuses; track status) { <option [ngValue]="status">{{ label(status) }}</option> }
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
              @for (client of clients(); track client.id) { <option [ngValue]="client.id">{{ client.name }}</option> }
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
                        @if (appointment.status === 'PENDING') { <button type="button" class="rounded-full border border-emerald-200 px-3 py-1.5 text-sm font-semibold text-emerald-700" (click)="changeStatus(appointment.id, 'CONFIRMED')">Confirmar</button> }
                        @if (appointment.status === 'CONFIRMED') { <button type="button" class="rounded-full border border-emerald-200 px-3 py-1.5 text-sm font-semibold text-emerald-700" (click)="changeStatus(appointment.id, 'COMPLETED')">Concluir</button> }
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

        <app-appointment-form #appointmentForm (appointmentSaved)="onAppointmentSaved($event)" />
      </div>
    </section>
  `
})
export class AppointmentsPageComponent implements OnInit {
  @ViewChild('appointmentForm') private appointmentForm?: AppointmentFormComponent;

  private readonly appointmentService = inject(AppointmentService);
  private readonly clientService = inject(ClientService);
  private readonly feedback = inject(FeedbackService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly statuses: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  protected readonly page = signal<ApiPage<Appointment>>({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 });
  protected readonly clients = signal<Client[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtersForm = this.fb.group({
    status: this.fb.control<AppointmentStatus | null>(null),
    date: this.fb.control(todayIsoDate()),
    clientId: this.fb.control<number | null>(null),
    page: this.fb.control(0)
  });

  ngOnInit(): void {
    this.clientService.list(0, 200).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((page) => this.clients.set(page.content));
    this.loadPage(0);
  }

  protected loadPage(pageNumber: number): void {
    this.filtersForm.controls.page.setValue(pageNumber, { emitEvent: false });
    this.loading.set(true);
    this.error.set(null);
    const filters = this.filtersForm.getRawValue();
    this.appointmentService.list({ status: filters.status, date: filters.date, clientId: filters.clientId, page: pageNumber, size: 10 })
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (page) => this.page.set(page), error: () => this.error.set('Não foi possível carregar os agendamentos.') });
  }

  protected applyFilters(): void { this.loadPage(0); }

  protected resetFilters(): void {
    this.filtersForm.reset({ status: null, date: todayIsoDate(), clientId: null, page: 0 });
    this.loadPage(0);
  }

  protected edit(appointment: Appointment): void { this.appointmentForm?.edit(appointment); }

  protected onAppointmentSaved(event: AppointmentSavedEvent): void {
    this.feedback.showSuccess(event.edited ? 'Agendamento atualizado.' : 'Agendamento criado.');
    this.loadPage(this.page().number);
  }

  protected changeStatus(id: number, status: AppointmentStatus): void {
    this.appointmentService.updateStatus(id, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.feedback.showSuccess(`Status alterado para ${appointmentStatusLabels[status]}.`);
      this.loadPage(this.page().number);
    });
  }

  protected remove(id: number): void {
    if (!window.confirm('Excluir este agendamento?')) return;
    this.appointmentService.delete(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.feedback.showSuccess('Agendamento excluído.');
      this.loadPage(this.page().number);
    });
  }

  protected label(status: AppointmentStatus): string { return appointmentStatusLabels[status]; }
  protected formatDateTime(value: string): string { return formatLocalDateTime(value); }
  protected currency(value: number): string { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); }
}
