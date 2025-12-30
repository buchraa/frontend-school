import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterModule],
  template: `
<div class="min-h-screen flex bg-gray-100">

      <!-- SIDEBAR -->
      <aside class="hidden md:flex w-64 bg-gray-900 text-gray-100 flex-col">
        <div class="h-14 flex items-center px-4 border-b border-gray-800">
          <span class="text-lg font-semibold tracking-wide">Daaray Admin</span>
        </div>

        <nav class="flex-1 p-3 space-y-1 text-sm">

          <a routerLink="/admin" 
             routerLinkActive="bg-gray-800"
             class="block px-3 py-2 rounded hover:bg-gray-800">
            Dashboard
          </a>

          <a routerLink="/admin/users"
             routerLinkActive="bg-gray-800"
             class="block px-3 py-2 rounded hover:bg-gray-800">
            Gestion utilisateurs
          </a>

          <a routerLink="/admin/classes-subjects"
             routerLinkActive="bg-gray-800"
             class="block px-3 py-2 rounded hover:bg-gray-800">
            Classes & matières
          </a>

        </nav>
      </aside>

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

    </div>  `,
})
export class AdminDashboard {
  userEmail = 'admin@example.com'; // TODO: remplacer par ton AuthService

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
  }
}
