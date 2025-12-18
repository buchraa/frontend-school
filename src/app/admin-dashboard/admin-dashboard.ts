import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { AdminService } from '../admin/admin.service';
import { CommonModule } from '@angular/common';
import { catchError, combineLatest, forkJoin, map, of, shareReplay, Subject } from 'rxjs';
import { NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import {  startWith, switchMap} from 'rxjs/operators';

type Kpis = {
  pendingEnrollments: number;
  students: number;
  teachers: number;
  classGroups: number;
};

type Vm = {
  loading: boolean;
  error: string | null;
  kpis: {
    pendingEnrollments: number;
    totalStudents: number;
    totalTeachers: number;
    totalClassGroups: number;
  };
  recentEnrollments: any[];
};
@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterModule,CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',  
})
export class AdminDashboard {
  private admin = inject(AdminService);

  private refresh$ = new Subject<void>();

  // ✅ ViewModel stream (comme TeacherDashboard)
  vm$ = this.refresh$.pipe(
    startWith(void 0), // charge automatiquement à l’arrivée sur la page
    switchMap(() =>
      forkJoin({
        kpis: this.admin.getKpis(),
        recent: this.admin.getRecentEnrollments(),
        // alerts: this.admin.getAlerts(), // si tu le remets plus tard
      }).pipe(
        map(({ kpis, recent }) => {
          const vm: Vm = {
            loading: false,
            error: null,
            kpis: {
              pendingEnrollments: kpis.pendingEnrollments ?? 0,
              totalStudents: kpis.students ?? 0,
              totalTeachers: kpis.teachers ?? 0,
              totalClassGroups: kpis.classGroups ?? 0,
            },
            recentEnrollments: Array.isArray(recent) ? recent : [],
          };
          return vm;
        }),
        // 🔥 On émet d’abord "loading=true" puis le résultat
        startWith({
          loading: true,
          error: null,
          kpis: {
            pendingEnrollments: 0,
            totalStudents: 0,
            totalTeachers: 0,
            totalClassGroups: 0,
          },
          recentEnrollments: [],
        } as Vm),
        catchError((e) =>
          of({
            loading: false,
            error: e?.error?.message || 'Erreur chargement dashboard.',
            kpis: {
              pendingEnrollments: 0,
              totalStudents: 0,
              totalTeachers: 0,
              totalClassGroups: 0,
            },
            recentEnrollments: [],
          } as Vm),
        ),
      ),
    ),
    shareReplay(1),
  );

  refresh() {
    this.refresh$.next();
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }

  trackById = (_: number, x: { id?: number }) => x?.id ?? _;

  badgeClass(status: string) {
    return {
      'bg-yellow-100 text-yellow-800': status === 'SUBMITTED',
      'bg-blue-100 text-blue-800': status === 'UNDER_REVIEW',
      'bg-purple-100 text-purple-800': status === 'PENDING_TEST',
      'bg-green-100 text-green-800': status === 'VALIDATED',
      'bg-red-100 text-red-800': status === 'REJECTED',
      'bg-gray-100 text-gray-800': !status,
    };
  }
}
