import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FeedbackService } from '../core/services/feedback.service';
import { PublicHeaderComponent } from '../shared/components/public-header/public-header.component';

@Component({
  standalone: true,
  selector: 'app-client-layout',
  imports: [PublicHeaderComponent, RouterOutlet],
  template: `
    <div class="min-h-screen bg-neutral-100">
      <app-public-header />
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
  constructor(protected readonly feedback: FeedbackService) {}
}
