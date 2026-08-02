import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../shared/models/appointment.model';
import { appointmentStatusLabels } from '../../shared/models/appointment-status.model';
import { formatLocalDateTime } from '../../shared/utils/date-time';

@Component({
  standalone: true,
  selector: 'app-appointment-detail',
  imports: [RouterLink],
  template: `
    <a routerLink="/appointments" class="text-sm font-semibold text-sky-700">← Voltar para agendamentos</a>
    @if (loading()) {
      <p class="mt-6 text-sm text-slate-500">Carregando agendamento...</p>
    } @else if (error()) {
      <div class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
        <p>{{ error() }}</p><button class="mt-3 font-semibold underline" type="button" (click)="load()">Tentar novamente</button>
      </div>
    } @else if (appointment(); as item) {
      <section class="mt-4 rounded-2xl bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div><p class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">Agendamento #{{ item.id }}</p>
            <h2 class="mt-2 text-3xl font-black text-slate-900">{{ item.client.name }}</h2></div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">{{ statusLabel(item.status) }}</span>
        </div>
        <dl class="mt-6 grid gap-5 sm:grid-cols-2">
          <div><dt class="text-sm text-slate-500">Data e horário</dt><dd class="font-semibold">{{ format(item.scheduledDateTime) }}</dd></div>
          <div><dt class="text-sm text-slate-500">Serviço</dt><dd class="font-semibold">{{ item.serviceType.name }}</dd></div>
          <div><dt class="text-sm text-slate-500">Valor do agendamento</dt><dd class="font-semibold">{{ currency(item.priceAtBooking) }}</dd></div>
          <div><dt class="text-sm text-slate-500">Veículo</dt><dd><a class="font-semibold text-sky-700" [routerLink]="['/vehicles', item.vehicle.id]">{{ item.vehicle.brand }} {{ item.vehicle.model }} · {{ item.vehicle.licensePlate }}</a></dd></div>
          <div><dt class="text-sm text-slate-500">Cliente</dt><dd><a class="font-semibold text-sky-700" [routerLink]="['/clients', item.client.id]">{{ item.client.name }}</a></dd></div>
          <div><dt class="text-sm text-slate-500">Criado em</dt><dd class="font-semibold">{{ format(item.createdAt) }}</dd></div>
          <div><dt class="text-sm text-slate-500">Atualizado em</dt><dd class="font-semibold">{{ item.updatedAt ? format(item.updatedAt) : '—' }}</dd></div>
        </dl>
      </section>
    }
  `
})
export class AppointmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AppointmentService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly appointment = signal<Appointment | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  ngOnInit(): void { this.load(); }
  protected load(): void {
    this.loading.set(true); this.error.set(null);
    this.service.getById(Number(this.route.snapshot.paramMap.get('id')))
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (item) => this.appointment.set(item), error: () => this.error.set('Não foi possível carregar o agendamento.') });
  }
  protected format(value: string): string { return formatLocalDateTime(value); }
  protected statusLabel(status: Appointment['status']): string { return appointmentStatusLabels[status]; }
  protected currency(value: number): string { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); }
}
