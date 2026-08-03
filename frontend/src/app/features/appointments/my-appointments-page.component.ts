import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ClientService } from '../../core/services/client';
import { FeedbackService } from '../../core/services/feedback.service';
import { Appointment } from '../../shared/models/appointment.model';
import { AppointmentStatus, appointmentStatusLabels } from '../../shared/models/appointment-status.model';
import { formatLocalDateTime } from '../../shared/utils/date-time';
import { AppointmentFormComponent } from './appointment-form.component';

@Component({
  standalone: true,
  selector: 'app-my-appointments-page',
  imports: [AppointmentFormComponent],
  template: `
    <section class="space-y-6">
      <div class="rounded-2xl bg-slate-900 px-6 py-7 text-white shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Minha agenda</p>
            <h2 class="mt-2 text-3xl font-black">Meus agendamentos</h2>
            <p class="mt-2 text-sm text-slate-300">Acompanhe seus serviços e reserve seu próximo horário.</p>
          </div>
          @if (clientId() !== null) {
            <button type="button" class="rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100" (click)="showForm.set(!showForm())">
              {{ showForm() ? 'Fechar formulário' : 'Agendar novo horário' }}
            </button>
          }
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:gap-5" aria-label="Galeria Elite Car">
        <img
          src="/images/my-appointments-image.avif"
          alt="Serviço de estética automotiva da Elite Car"
          class="aspect-[4/3] h-full w-full rounded-xl object-cover"
        />
        <img
          src="/images/my-appointments-image-2.avif"
          alt="Veículo cuidado pela equipe Elite Car"
          class="aspect-[4/3] h-full w-full rounded-xl object-cover"
        />
      </div>

      @if (clientId() === null) {
        <div class="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Não foi possível identificar o cliente associado à sua conta.
        </div>
      } @else {
        @if (showForm()) {
          <app-appointment-form [clientId]="clientId()" (appointmentSaved)="onAppointmentCreated()" />
        }

        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <h3 class="text-lg font-bold text-slate-900">Próximos e anteriores</h3>
            <button type="button" class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold" (click)="loadAppointments()">Atualizar</button>
          </div>

          @if (loading()) {
            <p class="mt-6 text-sm text-slate-500">Carregando seus agendamentos...</p>
          } @else if (error()) {
            <div class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              <p>{{ error() }}</p>
              <button type="button" class="mt-2 font-semibold underline" (click)="loadAppointments()">Tentar novamente</button>
            </div>
          } @else if (appointments().length === 0) {
            <div class="mt-6 rounded-2xl bg-sky-50 px-5 py-6 text-sky-900">
              <p class="font-semibold">Você ainda não tem agendamentos.</p>
              <p class="mt-1 text-sm">Agende seu primeiro serviço e deixe seu carro em boas mãos.</p>
            </div>
          } @else {
            <div class="mt-6 space-y-3">
              @for (appointment of appointments(); track appointment.id) {
                <article class="rounded-2xl bg-slate-50 p-5 shadow-sm">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p class="text-lg font-bold text-slate-900">{{ appointment.serviceType.name }}</p>
                      <p class="mt-1 text-sm text-slate-500">{{ formatDateTime(appointment.scheduledDateTime) }} · {{ appointment.vehicle.brand }} {{ appointment.vehicle.model }} · {{ appointment.vehicle.licensePlate }}</p>
                    </div>
                    <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">{{ label(appointment.status) }}</span>
                  </div>
                </article>
              }
            </div>
          }
        </div>
      }

      <footer class="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        © Elite Car · Estética automotiva premium
      </footer>
    </section>
  `
})
export class MyAppointmentsPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly clientService = inject(ClientService);
  private readonly feedback = inject(FeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly clientId = this.auth.clientId;
  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly showForm = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void { this.loadAppointments(); }

  protected loadAppointments(): void {
    const id = this.clientId();
    if (id === null) return;
    this.loading.set(true);
    this.error.set(null);
    this.clientService.getAppointments(id)
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (appointments) => this.appointments.set([...appointments].sort((a, b) => b.scheduledDateTime.localeCompare(a.scheduledDateTime))),
        error: () => this.error.set('Não foi possível carregar seus agendamentos.')
      });
  }

  protected onAppointmentCreated(): void {
    this.feedback.showSuccess('Agendamento criado.');
    this.showForm.set(false);
    this.loadAppointments();
  }

  protected label(status: AppointmentStatus): string { return appointmentStatusLabels[status]; }
  protected formatDateTime(value: string): string { return formatLocalDateTime(value); }
}
