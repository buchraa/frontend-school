import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, CurrentUser } from '../auth/auth.service';
type MenuItem = { label: string; to: any[]; roles?: string[] };


@Component({
  selector: 'app-admin-home',
imports: [CommonModule, RouterModule],
template: `
    <div class="min-h-screen flex bg-gray-100">

        <!-- sidebar desktop -->
    <aside class="hidden md:flex w-64 bg-gray-900 text-gray-100 flex-col">
        <div class="h-14 flex items-center px-4 border-b border-gray-800">
          <span class="text-lg font-semibold tracking-wide">Daaray Admin</span>
        </div>
    <nav class="flex-1 p-3 space-y-1 text-sm">
        @for (item of menu; track item.label) {
          <a [routerLink]="item.to"
             class="block px-3 py-2 rounded hover:bg-gray-800">
            {{ item.label }}
          </a>
        }
      </nav>
    </aside>

    <!-- sidebar mobile -->
    @if (mobileOpen()) {
      <div class="md:hidden fixed inset-0 bg-black/50 z-40" (click)="toggleMobile()"></div>
      <aside class="md:hidden fixed z-50 top-14 left-0 w-72 h-[calc(100vh-3.5rem)] bg-slate-950 border-r border-slate-800 p-3">
        <nav class="space-y-1">
          @for (item of menu; track item.label) {
            <a [routerLink]="item.to"
               (click)="mobileOpen.set(false)"
               class="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-900">
              {{ item.label }}
            </a>
          }
        </nav>
      </aside>
    }

      <!-- MAIN -->
      <div class="flex-1 flex flex-col">

        <!-- TOPBAR -->
        <header class="h-14 bg-white border-b border-gray-200 
                       flex items-center justify-between px-6 shadow-sm">
          <h1 class="text-lg font-semibold text-gray-800">Espace Administrateur</h1>

          <div class="flex items-center gap-3 text-sm text-gray-600">
            <span>{{ userEmail }}</span>
            <button class="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    (click)="logout()">
              Déconnexion
            </button>
          </div>
        </header>

        <!-- CONTENT AREA -->
        <main class="flex-1 p-6">
          <div class="max-w-6xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>

      </div>

    </div>
  `})
export class AdminHome implements OnInit {
    users: CurrentUser[] = [];
    loading = false;
    user: CurrentUser | null = null;
    userEmail = '';
  
    constructor(private authService: AuthService) {}

  ngOnInit(): void {
this.user = this.authService.getCurrentUser();

this.userEmail = this.user?.email ?? '';


  }
  
  // menu staff + "admin pages" réutilisées
  menu: MenuItem[] = [
    { label: 'Accueil', to: ['/admin'] },
  { label: 'Inscriptions', to: ['/admin/enrollments'] },
    { label: 'Utilisateurs', to: ['/admin/users'] },
    { label: 'Classes', to: ['/admin/classes-subjects'] },

  ];
 logout() {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }

    mobileOpen = signal(false);

  toggleMobile() {
    this.mobileOpen.set(!this.mobileOpen());
  }
  
}
