import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { FeedbackService } from './core/services/feedback.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Autocare Scheduler');
  protected readonly navigation = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Clientes', path: '/clients' },
    { label: 'Veículos', path: '/vehicles' },
    { label: 'Tipos de Serviço', path: '/service-types' },
    { label: 'Agendamentos', path: '/appointments' }
  ] as const;

  constructor(protected readonly feedback: FeedbackService) {}
}
