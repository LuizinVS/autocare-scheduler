import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../shared/models/appointment.model';
import { formatLocalDateTime, todayIsoDate } from '../../shared/utils/date-time';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <section class="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <div class="space-y-6">
        <div class="rounded-2xl bg-slate-900 px-6 py-7 text-white shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.36em] text-slate-400">Visão geral</p>
          <h2 class="mt-2 text-3xl font-black sm:text-4xl">Agenda de hoje</h2>
          <p class="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Acompanhe os agendamentos do dia, acesse os cadastros e mantenha o fluxo operacional do autocare em um só lugar.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a routerLink="/appointments" class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">Ir para agendamentos</a>
            <a routerLink="/clients" class="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">Clientes</a>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <article class="rounded-2xl bg-white p-5 shadow-sm">
            <p class="text-sm text-slate-500">Total de hoje</p>
            <p class="mt-2 text-3xl font-black text-slate-900">{{ appointments().length }}</p>
          </article>
          <article class="rounded-2xl bg-white p-5 shadow-sm">
            <p class="text-sm text-slate-500">Confirmados</p>
            <p class="mt-2 text-3xl font-black text-emerald-600">{{ confirmedCount() }}</p>
          </article>
          <article class="rounded-2xl bg-white p-5 shadow-sm">
            <p class="text-sm text-slate-500">Pendentes</p>
            <p class="mt-2 text-3xl font-black text-amber-600">{{ pendingCount() }}</p>
          </article>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-slate-900">Agendamentos de hoje</h3>
              <p class="text-sm text-slate-500">{{ today() }}</p>
            </div>
            <button type="button" class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700" (click)="reload()">Atualizar</button>
          </div>

          @if (loading()) {
            <p class="mt-6 text-sm text-slate-500">Carregando agenda...</p>
          } @else if (error()) {
            <div class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><p>{{ error() }}</p><button type="button" class="mt-2 font-semibold underline" (click)="reload()">Tentar novamente</button></div>
          } @else if (appointments().length === 0) {
            <p class="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Nenhum agendamento encontrado para hoje.</p>
          } @else {
            <div class="mt-6 space-y-3">
              @for (appointment of appointments(); track appointment.id) {
                <article class="rounded-2xl bg-slate-50 px-4 py-4 shadow-sm">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p class="font-semibold text-slate-900">{{ appointment.client.name }} - {{ appointment.vehicle.licensePlate }}</p>
                      <p class="text-sm text-slate-500">{{ formatDateTime(appointment.scheduledDateTime) }} · {{ appointment.serviceType.name }}</p>
                    </div>
                    <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">{{ appointment.status }}</span>
                  </div>
                </article>
              }
            </div>
          }
        </div>
      </div>

      <aside class="space-y-6">
        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <h3 class="text-lg font-bold text-slate-900">Atalhos</h3>
          <div class="mt-4 grid gap-3">
            <a routerLink="/appointments" class="rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-800 transition hover:bg-slate-200">Criar agendamento</a>
            <a routerLink="/service-types" class="rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-800 transition hover:bg-slate-200">Gerenciar serviços</a>
            <a routerLink="/vehicles" class="rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-800 transition hover:bg-slate-200">Cadastrar veículo</a>
          </div>
        </div>
      </aside>
    </section>
  `
})
export class DashboardComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly today = signal(todayIsoDate());
  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly confirmedCount = computed(() => this.appointments().filter((item) => item.status === 'CONFIRMED').length);
  protected readonly pendingCount = computed(() => this.appointments().filter((item) => item.status === 'PENDING').length);

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.appointmentService
      .list({ date: this.today(), size: 100, page: 0 })
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (page) => this.appointments.set(page.content), error: () => this.error.set('Não foi possível carregar a agenda de hoje.') });
  }

  protected formatDateTime(value: string): string {
    return formatLocalDateTime(value);
  }
}
