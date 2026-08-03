import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../core/services/auth.service';
import { FeedbackService } from '../core/services/feedback.service';
import { PublicHeaderComponent } from '../shared/components/public-header/public-header.component';

@Component({
  standalone: true,
  selector: 'app-client-layout',
  imports: [PublicHeaderComponent, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-neutral-100">
      <app-public-header />
      @if (auth.role() === 'CLIENT') {
        <nav aria-label="Navegação do cliente" class="border-t border-white/10 bg-black px-5 pb-4 sm:px-8 lg:px-10">
          <div class="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
            @for (item of navigation; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-white !text-black"
                class="whitespace-nowrap rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-white/50 hover:text-white"
              >{{ item.label }}</a>
            }
          </div>
        </nav>
      }
      <main class="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        @if (feedback.message(); as message) {
          <div role="status" class="mb-6 flex items-center justify-between gap-4 rounded-2xl px-4 py-3 text-sm shadow-sm" [class]="message.kind === 'error' ? 'bg-rose-50 text-rose-900' : message.kind === 'success' ? 'bg-emerald-50 text-emerald-900' : 'bg-sky-50 text-sky-900'">
            <span>{{ message.text }}</span>
            <button class="rounded-full px-3 py-1 font-semibold hover:bg-black/5" type="button" (click)="feedback.clear()">Fechar</button>
          </div>
        }
        <router-outlet />
      </main>
    </div>
  `
})
export class ClientLayoutComponent {
  protected readonly navigation = [
    { label: 'Meus Agendamentos', path: '/my/appointments' },
    { label: 'Meus Veículos', path: '/my/vehicles' },
    { label: 'Perfil', path: '/profile' }
  ] as const;

  constructor(protected readonly auth: AuthService, protected readonly feedback: FeedbackService) {}
}
