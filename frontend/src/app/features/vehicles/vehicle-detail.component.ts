import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VehicleService } from '../../core/services/vehicle.service';
import { Vehicle } from '../../shared/models/vehicle.model';
import { formatLocalDateTime } from '../../shared/utils/date-time';

@Component({
  standalone: true, selector: 'app-vehicle-detail', imports: [RouterLink],
  template: `
    <a routerLink="/vehicles" class="text-sm font-semibold text-sky-700">← Voltar para veículos</a>
    @if (loading()) { <p class="mt-6 text-sm text-slate-500">Carregando veículo...</p> }
    @else if (error()) { <div class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900"><p>{{ error() }}</p><button class="mt-3 font-semibold underline" type="button" (click)="load()">Tentar novamente</button></div> }
    @else if (vehicle(); as item) {
      <section class="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">Veículo #{{ item.id }}</p>
        <h2 class="mt-2 text-3xl font-black">{{ item.brand }} {{ item.model }}</h2>
        <dl class="mt-6 grid gap-5 sm:grid-cols-2">
          <div><dt class="text-sm text-slate-500">Placa</dt><dd class="font-semibold">{{ item.licensePlate }}</dd></div>
          <div><dt class="text-sm text-slate-500">Cliente</dt><dd><a class="font-semibold text-sky-700" [routerLink]="['/clients', item.client.id]">{{ item.client.name }}</a></dd></div>
          <div><dt class="text-sm text-slate-500">Criado em</dt><dd class="font-semibold">{{ format(item.createdAt) }}</dd></div>
        </dl>
      </section>
    }`
})
export class VehicleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute); private readonly service = inject(VehicleService); private readonly destroyRef = inject(DestroyRef);
  protected readonly vehicle = signal<Vehicle | null>(null); protected readonly loading = signal(false); protected readonly error = signal<string | null>(null);
  ngOnInit(): void { this.load(); }
  protected load(): void { this.loading.set(true); this.error.set(null); this.service.getById(Number(this.route.snapshot.paramMap.get('id'))).pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (item) => this.vehicle.set(item), error: () => this.error.set('Não foi possível carregar o veículo.') }); }
  protected format(value: string): string { return formatLocalDateTime(value); }
}
