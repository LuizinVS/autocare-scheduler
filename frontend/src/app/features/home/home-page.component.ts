import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [RouterLink],
  host: { class: 'fixed inset-0 z-50 block overflow-y-auto bg-black text-white' },
  template: `
    <div class="flex min-h-svh flex-col bg-black">
      <header class="flex-none bg-black px-6 sm:px-10 lg:px-16">
        <div class="mx-auto flex w-full max-w-7xl items-center justify-between py-7 sm:py-9">
        <a routerLink="/home" class="text-xl font-black uppercase tracking-[0.18em] text-white sm:text-2xl">Elite Car</a>

        <nav aria-label="Navegação institucional" class="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a href="#sobre" class="transition hover:text-white">Sobre</a>
          <a href="#servicos" class="transition hover:text-white">Serviços</a>
          <a href="#contato" class="transition hover:text-white">Contato</a>
        </nav>

        <a routerLink="/login" class="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold transition hover:border-white hover:bg-white hover:text-black">Entrar</a>
        </div>
      </header>

      <div
        class="flex flex-1 flex-col bg-cover bg-center px-6 sm:px-10 lg:px-16"
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
