import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ClientService } from '../../core/services/client';
import { FeedbackService } from '../../core/services/feedback.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { VehicleDTO } from '../../shared/models/vehicle-dto.model';
import { Vehicle } from '../../shared/models/vehicle.model';
import { VehicleSize, vehicleSizeLabels, vehicleSizes } from '../../shared/models/vehicle-size.model';

@Component({
  standalone: true,
  selector: 'app-my-vehicles-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="space-y-6">
      <div class="rounded-2xl bg-slate-900 px-6 py-7 text-white shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Minha garagem</p>
        <h2 class="mt-2 text-3xl font-black">Meus veículos</h2>
        <p class="mt-2 text-sm text-slate-300">Cadastre e consulte os veículos vinculados à sua conta.</p>
      </div>

      @if (clientId() === null) {
        <div class="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Não foi possível identificar o cliente associado à sua conta.
        </div>
      } @else {
        <div class="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4">
              <h3 class="text-lg font-bold text-slate-900">Veículos cadastrados</h3>
              <button type="button" class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700" (click)="loadVehicles()">Atualizar</button>
            </div>

            @if (loading()) {
              <p class="mt-6 text-sm text-slate-500">Carregando seus veículos...</p>
            } @else if (error()) {
              <div class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                <p>{{ error() }}</p>
                <button type="button" class="mt-2 font-semibold underline" (click)="loadVehicles()">Tentar novamente</button>
              </div>
            } @else if (vehicles().length === 0) {
              <div class="mt-6 rounded-2xl bg-sky-50 px-5 py-6 text-sky-900">
                <p class="font-semibold">Você ainda não cadastrou nenhum veículo.</p>
                <p class="mt-1 text-sm">Adicione seu primeiro veículo para poder agendar um serviço.</p>
              </div>
            } @else {
              <div class="mt-6 grid gap-3 sm:grid-cols-2">
                @for (vehicle of vehicles(); track vehicle.id) {
                  <article class="rounded-2xl bg-slate-50 p-5 shadow-sm">
                    <p class="text-lg font-bold text-slate-900">{{ vehicle.brand }} {{ vehicle.model }}</p>
                    <div class="mt-3 space-y-1 text-sm text-slate-600">
                      <p><span class="font-semibold text-slate-800">Placa:</span> {{ vehicle.licensePlate }}</p>
                      <p><span class="font-semibold text-slate-800">Porte:</span> {{ sizeLabel(vehicle.size) }}</p>
                    </div>
                  </article>
                }
              </div>
            }
          </div>

          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <h3 class="text-lg font-bold text-slate-900">Cadastrar veículo</h3>
            <form class="mt-5 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
              <label class="block"><span class="mb-1 block text-sm font-semibold text-slate-700">Marca</span><input class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-sky-300 focus:ring-4" formControlName="brand" /></label>
              <label class="block"><span class="mb-1 block text-sm font-semibold text-slate-700">Modelo</span><input class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-sky-300 focus:ring-4" formControlName="model" /></label>
              <label class="block"><span class="mb-1 block text-sm font-semibold text-slate-700">Placa</span><input class="w-full rounded-2xl border border-slate-300 px-4 py-3 uppercase outline-none ring-sky-300 focus:ring-4" formControlName="licensePlate" /></label>
              <label class="block">
                <span class="mb-1 block text-sm font-semibold text-slate-700">Porte do veículo</span>
                <select class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-sky-300 focus:ring-4" formControlName="size">
                  <option [ngValue]="null">Selecione</option>
                  @for (size of sizes; track size) { <option [ngValue]="size">{{ sizeLabel(size) }}</option> }
                </select>
              </label>

              @if (form.invalid && formSubmitted()) {
                <p class="text-sm text-rose-700">Preencha todos os campos obrigatórios.</p>
              }

              <button type="submit" class="w-full rounded-full bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60" [disabled]="submitting()">
                {{ submitting() ? 'Salvando...' : 'Cadastrar veículo' }}
              </button>
            </form>
          </div>
        </div>
      }
    </section>
  `
})
export class MyVehiclesPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly clientService = inject(ClientService);
  private readonly vehicleService = inject(VehicleService);
  private readonly feedback = inject(FeedbackService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly clientId = this.auth.clientId;
  protected readonly vehicles = signal<Vehicle[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly sizes = vehicleSizes;
  protected readonly form = this.fb.group({
    brand: this.fb.nonNullable.control('', Validators.required),
    model: this.fb.nonNullable.control('', Validators.required),
    licensePlate: this.fb.nonNullable.control('', Validators.required),
    size: this.fb.control<VehicleSize | null>(null, Validators.required)
  });

  ngOnInit(): void { this.loadVehicles(); }

  protected loadVehicles(): void {
    const id = this.clientId();
    if (id === null) return;
    this.loading.set(true);
    this.error.set(null);
    this.clientService.getVehicles(id)
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (vehicles) => this.vehicles.set(vehicles), error: () => this.error.set('Não foi possível carregar seus veículos.') });
  }

  protected submit(): void {
    this.formSubmitted.set(true);
    const clientId = this.clientId();
    if (this.form.invalid || clientId === null) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: VehicleDTO = {
      clientId,
      brand: value.brand.trim(),
      model: value.model.trim(),
      licensePlate: value.licensePlate.trim().toUpperCase(),
      size: value.size as VehicleSize
    };

    this.submitting.set(true);
    this.vehicleService.create(payload)
      .pipe(finalize(() => this.submitting.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.feedback.showSuccess('Veículo cadastrado com sucesso.');
        this.formSubmitted.set(false);
        this.form.reset({ brand: '', model: '', licensePlate: '', size: null });
        this.loadVehicles();
      });
  }

  protected sizeLabel(size: VehicleSize): string { return vehicleSizeLabels[size]; }
}
