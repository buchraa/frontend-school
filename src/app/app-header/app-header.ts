import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  template: `
    <header class="w-full bg-slate-900 text-white">
      <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <a routerLink="/" class="font-semibold tracking-wide">
          Daaray Paris
        </a>

        <nav class="flex items-center gap-3">
          <!-- NON CONNECTÉ -->
          <a
            *ngIf="!auth.isLoggedIn()"
            routerLink="/login"
            class="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600"
          >
            Se connecter
          </a>

          <!-- CONNECTÉ -->
          <ng-container *ngIf="auth.isLoggedIn()">
            <a
              [routerLink]="dashboardLink"
              class="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500"
            >
              Mon espace
            </a>

            <button
              type="button"
              (click)="logout()"
              class="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500"
            >
              Se déconnecter
            </button>
          </ng-container>
        </nav>
      </div>
    </header>
  `,
})
export class AppHeader {
  auth = inject(AuthService);
  private router = inject(Router);

  get dashboardLink(): string {
    const user = this.auth.getCurrentUser();
    if (!user) return '/';

    switch (user.role) {
      case 'ADMIN':   return '/admin/dashboard';
      case 'STAFF':   return '/staff/dashboard';
      case 'BENEVOL':   return '/staff/dashboard';
      case 'TEACHER': return '/teacher/dashboard';
      case 'PARENT':  return '/parent/dashboard';
      default:        return '/';
    }
  }

  logout() {
    this.auth.logout(); // doit supprimer token + currentUser
    this.router.navigateByUrl('/');
  }
}
