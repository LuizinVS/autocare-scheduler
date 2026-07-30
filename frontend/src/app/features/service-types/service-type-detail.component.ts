import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ServiceTypeService } from '../../core/services/service-type.service';
import { ServiceType } from '../../shared/models/service-type.model';
import { formatLocalDateTime } from '../../shared/utils/date-time';

@Component({
  standalone: true, selector: 'app-service-type-detail', imports: [RouterLink],
  template: `
    <a routerLink="/service-types" class="text-sm font-semibold text-sky-700">← Voltar para tipos de serviço</a>
    @if (loading()) { <p class="mt-6 text-sm text-slate-500">Carregando tipo de serviço...</p> }
    @else if (error()) { <div class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900"><p>{{ error() }}</p><button class="mt-3 font-semibold underline" type="button" (click)="load()">Tentar novamente</button></div> }
    @else if (serviceType(); as item) {
      <section class="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">Tipo de serviço #{{ item.id }}</p>
        <h2 class="mt-2 text-3xl font-black">{{ item.name }}</h2>
        <dl class="mt-6 grid gap-5 sm:grid-cols-2">
          <div><dt class="text-sm text-slate-500">Preço</dt><dd class="font-semibold">{{ currency(item.price) }}</dd></div>
          <div><dt class="text-sm text-slate-500">Criado em</dt><dd class="font-semibold">{{ format(item.createdAt) }}</dd></div>
        </dl>
      </section>
    }`
})
export class ServiceTypeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute); private readonly service = inject(ServiceTypeService); private readonly destroyRef = inject(DestroyRef);
  protected readonly serviceType = signal<ServiceType | null>(null); protected readonly loading = signal(false); protected readonly error = signal<string | null>(null);
  ngOnInit(): void { this.load(); }
  protected load(): void { this.loading.set(true); this.error.set(null); this.service.getById(Number(this.route.snapshot.paramMap.get('id'))).pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (item) => this.serviceType.set(item), error: () => this.error.set('Não foi possível carregar o tipo de serviço.') }); }
  protected format(value: string): string { return formatLocalDateTime(value); }
  protected currency(value: number): string { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); }
}
