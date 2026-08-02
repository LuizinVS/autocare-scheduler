import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ClientService } from '../../core/services/client';
import { Appointment } from '../../shared/models/appointment.model';
import { Client } from '../../shared/models/client.model';
import { Vehicle } from '../../shared/models/vehicle.model';
import { formatLocalDateTime } from '../../shared/utils/date-time';

@Component({
  standalone: true,
  selector: 'app-client-detail',
  imports: [RouterLink],
  template: `
    @if (loading()) {
      <p class="text-sm text-slate-500">Carregando detalhes do cliente...</p>
    } @else if (error()) {
      <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><p>{{ error() }}</p><button type="button" class="mt-2 font-semibold underline" (click)="load()">Tentar novamente</button></div>
    } @else if (client()) {
      <section class="space-y-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <a routerLink="/clients" class="text-sm font-semibold text-sky-700">← Voltar para clientes</a>
            <h2 class="mt-2 text-3xl font-black text-slate-900">{{ client()!.name }}</h2>
            <p class="mt-1 text-slate-500">{{ client()!.email }} · {{ client()!.phone }}</p>
          </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-2">
          <article class="rounded-2xl bg-white p-6 shadow-sm">
            <h3 class="text-lg font-bold text-slate-900">Veículos</h3>
            @if (vehicles().length === 0) {
              <p class="mt-4 text-sm text-slate-500">Nenhum veículo vinculado.</p>
            } @else {
              <div class="mt-4 space-y-3">
                @for (vehicle of vehicles(); track vehicle.id) {
                  <div class="rounded-2xl bg-slate-50 px-4 py-3">
                    <p class="font-semibold text-slate-900">{{ vehicle.brand }} {{ vehicle.model }}</p>
                    <p class="text-sm text-slate-500">Placa {{ vehicle.licensePlate }}</p>
                  </div>
                }
              </div>
            }
          </article>

          <article class="rounded-2xl bg-white p-6 shadow-sm">
            <h3 class="text-lg font-bold text-slate-900">Histórico de agendamentos</h3>
            @if (appointments().length === 0) {
              <p class="mt-4 text-sm text-slate-500">Nenhum agendamento encontrado.</p>
            } @else {
              <div class="mt-4 space-y-3">
                @for (appointment of appointments(); track appointment.id) {
                  <div class="rounded-2xl bg-slate-50 px-4 py-3">
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <p class="font-semibold text-slate-900">{{ formatDateTime(appointment.scheduledDateTime) }}</p>
                        <p class="text-sm text-slate-500">{{ appointment.serviceType.name }} · {{ appointment.vehicle.licensePlate }}</p>
                      </div>
                      <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">{{ appointment.status }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </article>
        </div>
      </section>
    }
  `
})
export class ClientDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly clientService = inject(ClientService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly client = signal<Client | null>(null);
  protected readonly vehicles = signal<Vehicle[]>([]);
  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      client: this.clientService.getById(id),
      vehicles: this.clientService.getVehicles(id),
      appointments: this.clientService.getAppointments(id)
    }).pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: ({ client, vehicles, appointments }) => {
        this.client.set(client);
        this.vehicles.set(vehicles);
        this.appointments.set(appointments);
      },
      error: () => this.error.set('Não foi possível carregar os detalhes do cliente.')
    });
  }

  protected formatDateTime(value: string): string {
    return formatLocalDateTime(value);
  }
}
