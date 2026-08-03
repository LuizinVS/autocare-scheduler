import { Component } from '@angular/core';

import { PublicHeaderComponent } from '../../shared/components/public-header/public-header.component';

@Component({
  standalone: true,
  selector: 'app-profile-page',
  imports: [PublicHeaderComponent],
  template: `
    <div class="min-h-screen bg-black text-white">
      <app-public-header />

      <main class="flex min-h-[calc(100vh-76px)] items-center justify-center px-6">
        <h1 class="text-2xl font-bold">Em construção</h1>
      </main>
    </div>
  `
})
export class ProfilePageComponent {}
