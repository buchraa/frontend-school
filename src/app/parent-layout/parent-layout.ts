import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-parent-layout',
imports: [RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">

      <!-- HEADER -->
      <header class="bg-white shadow-sm">
        <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="font-semibold text-gray-800">Daaray Paris</div>

          <div class="text-sm flex items-center gap-3 text-gray-600">
            {{ parentName }}  
            <button (click)="logout()" 
              class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <!-- CONTENT -->
      <main class="max-w-5xl mx-auto px-4 py-6">
        <router-outlet></router-outlet>
      </main>

    </div>
  `
})
export class ParentLayout {
  parentName = "Parent";

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }
}