import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="min-h-screen relative overflow-hidden">
    <!-- Background -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      [ngStyle]="{ 'background-image': 'url(' + bgUrl + ')' }"
    ></div>

    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/40"></div>

    <!-- Content -->
    <div class="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md">
        <!-- Logo + title -->
        <div class="flex flex-col items-center mb-6 text-center">
          <img
            [src]="logoUrl"
            alt="DAARAY PARIS"
            class="w-20 h-20 rounded-full shadow-lg border border-white/30 bg-white/10"
          />
          <h1 class="mt-4 text-2xl font-semibold text-white">
            {{ title }}
          </h1>
          <p *ngIf="subtitle" class="text-sm text-white/80 mt-1">
            {{ subtitle }}
          </p>
        </div>

        <!-- Card -->
        <div class="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-5 border border-white/30">
          <ng-content></ng-content>
        </div>

        <div class="mt-4 text-center text-xs text-white/80">
          © {{ year }} DAARAY PARIS
        </div>
      </div>
    </div>
  </div>
  `,
})
export class PublicAuthLayout {
  @Input() title = 'DAARAY PARIS';
  @Input() subtitle?: string;

  bgUrl = '/assets/backgrounds/bg-login.png';
  logoUrl = '/assets/logo/daaray-paris-logo.png';
  year = new Date().getFullYear();
}
