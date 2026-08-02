import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-public-header',
  imports: [RouterLink],
  template: `
    <header class="flex-none bg-black px-4 sm:px-6 lg:px-10">
        <div class="flex w-full items-center px-6 py-4 sm:px-10 sm:py-5 lg:px-20">
        <a routerLink="/home" class="text-xl font-black uppercase tracking-[0.18em] text-white sm:text-2xl">Elite Car</a>

        <nav aria-label="Navegação institucional" class="ml-auto items-center gap-8 text-sm text-white/60 md:flex">
          <a href="#sobre" class="transition hover:text-white">Sobre</a>
          <a href="#servicos" class="transition hover:text-white">Serviços</a>
          <a href="#contato" class="transition hover:text-white">Contato</a>
        </nav>

        <a routerLink="/login" class="ml-6 rounded-lg border border-white/40 px-5 py-2 text-sm font-semibold transition hover:border-white hover:bg-white hover:text-black">Entrar</a>
      </div>
    </header>
  `
})
export class PublicHeaderComponent {}
