import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PublicHeaderComponent } from '../../shared/components/public-header/public-header.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [PublicHeaderComponent, RouterLink],
  host: { class: 'fixed inset-0 z-50 block overflow-y-auto bg-black text-white' },
  template: `
    <div class="flex min-h-svh flex-col bg-black">
      <app-public-header />

      <div
        class="flex flex-1 flex-col bg-cover bg-center px-4 sm:px-6 lg:px-10"
        style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.9)), url('/images/home-background.jpg')"
      >
      <main class="mx-auto flex w-full max-w-7xl flex-1 items-center py-16 sm:py-24">
        <section class="max-w-5xl">
          <p class="text-xs font-semibold uppercase tracking-[0.38em] text-white/45">Estética automotiva premium</p>
          <h1 class="mt-7 max-w-4xl text-6xl font-black leading-[0.92] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
            Elite Car Estética Automotiva
          </h1>
          <p class="mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
            Cuidado de alto padrão para o seu veículo, com serviços especializados e agendamento simples em um só lugar.
          </p>
          <a routerLink="/register" class="mt-10 inline-flex rounded-full bg-white px-7 py-3.5 font-bold text-black transition hover:bg-white/85">
            Criar conta
          </a>
        </section>
      </main>

      <footer id="contato" class="mx-auto w-full max-w-7xl py-7 text-xs text-white/25">© Elite Car</footer>
      </div>
    </div>
  `
})
export class HomePageComponent {}
