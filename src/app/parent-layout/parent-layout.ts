import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { catchError, map, Observable, of, startWith, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Parent, ParentService } from '../parent/parent.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';



type Vm = {
  loading: boolean;
  error: string | null;
  parent: Parent | null;
};

@Component({
selector: 'app-parent-layout',
imports: [RouterModule, CommonModule,],
  template: `

      <!-- HEADER -->
 <header class="w-full bg-slate-900 text-white">
      <div class="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">         
         <div class="font-semibold">Daaray Paris</div>
        <ng-container *ngIf="vm$ | async as vm">
          <div class="text-sm flex items-center gap-3 text-gray-600">
            {{ vm.parent?.fullName }}  
            <button (click)="logout()" 
              class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs">
              Déconnexion
            </button>
                <a routerLink="/parent/dashboard" class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs">
      Accueil
    </a>
          </div>
          
          </ng-container>
        </div>
      </header>

      <!-- CONTENT -->
      <main class="max-w-7xl mx-auto px-4 py-6">
        <router-outlet></router-outlet>
      </main>

  `
})
export class ParentLayout {
  parentName = "Parent";
private svc = inject(ParentService);
    // trigger reload
  private reload = signal(0);
  private reload$ = toObservable(this.reload);
  
  // pour existing children: on modifie directement sur enrollment.children (binding)
  vm$ = this.reload$.pipe(
    switchMap(() =>
      this.svc.getMe().pipe(
        map((parent) => ({ loading: false, error: null, parent } as Vm)),
        startWith({ loading: true, error: null, parent: null } as Vm),
        catchError((e) =>
          of({
            loading: false,
            error: e?.error?.message || 'Impossible de charger votre inscription.',
            parent: null,
          } as Vm),
        ),
      ),
    ),
  );


  logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
  }
}