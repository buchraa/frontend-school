import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.model';

@Component({
  selector: 'app-staff-layout',
  imports: [RouterModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-50">

      <!-- HEADER -->
      <header class="border-b border-slate-800">
        <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          
          <!-- Brand -->
          <div class="flex items-center gap-2">
            <div class="h-7 w-7 rounded bg-indigo-500 flex items-center justify-center text-xs font-bold">
              DP
            </div>
            <div>
              <div class="text-sm font-semibold">Daaray Paris</div>
              <div class="text-xs text-slate-400">Espace Gestionnaire</div>
            </div>
          </div>

          <!-- Right -->
          <div class="flex items-center gap-3 text-xs text-slate-400">
            {{ userEmail }}
            <button (click)="logout()"
              class="px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700">
              Logout
            </button>
          </div>
        
        </div>
      </header>

      <!-- CONTENT -->
      <main class="max-w-6xl mx-auto px-4 py-6">
        <router-outlet></router-outlet>
      </main>

    </div>
  `,})
export class StaffLayout implements OnInit {
    users: CurrentUser[] = [];
    loading = false;
    user: CurrentUser | null = null;
    userEmail = '';
  
    constructor(private authService: AuthService) {}

  ngOnInit(): void {
this.user = this.authService.getCurrentUser();

this.userEmail = this.user?.email ?? '';


  }
  

 logout() {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }
   }