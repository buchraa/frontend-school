import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EnrollmentAdminService } from './enrollment-admin.service'; // adapte si besoin
import { combineLatest, map, of, shareReplay, startWith, catchError } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

type Status =
  | 'ALL'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PENDING_TEST'
  | 'VALIDATED'
  | 'REJECTED';

@Component({
  selector: 'app-admin-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-enrollments.html',
})
export class AdminEnrollments {
  private service = inject(EnrollmentAdminService);

  // UI filters (signals)
  search = signal('');
  statusFilter = signal<Status>('ALL');
  savingId = signal<number | null>(null);

  // data stream
  private requests$ = this.service.getAllEnrollments().pipe(
    catchError((e) =>
      of({
        __error: e?.error?.message || 'Erreur lors du chargement des demandes.',
        data: [],
      } as any)
    ),
    shareReplay(1)
  );

  // vm$
  vm$ = combineLatest([
    this.requests$.pipe(startWith([] as any)),
    toObservable(this.search).pipe(startWith('')),
    toObservable(this.statusFilter).pipe(startWith('ALL' as Status)),
    toObservable(this.savingId).pipe(startWith(null)),
  ]).pipe(
    map(([raw, search, status, savingId]) => {
      const error = raw?.__error ?? null;
      const requests = Array.isArray(raw) ? raw : raw?.data ?? [];

      const term = (search || '').toLowerCase().trim();

      const filtered = requests.filter((r: any) => {
        const matchText =
          !term ||
          (r.parent?.fullName || '').toLowerCase().includes(term) ||
          (r.parent?.familyCode || '').toLowerCase().includes(term);

        const matchStatus = status === 'ALL' || r.status === status;

        return matchText && matchStatus;
      });

      return {
        loading: raw === null, // pas critique ici
        error,
        requests: filtered,
        savingId,
      };
    }),
    startWith({ loading: true, error: null, requests: [], savingId: null }),
    shareReplay(1)
  );

  updateStatus(r: any, status: Exclude<Status, 'ALL'>) {
    this.savingId.set(r.id);

    this.service.updateStatus(r.id, status).subscribe({
      next: (updated: any) => {
        // update optimiste local (pas obligatoire)
        r.status = updated?.status ?? status;
        this.savingId.set(null);
      },
      error: (e) => {
        alert(e?.error?.message || 'Erreur lors de la mise à jour du statut.');
        this.savingId.set(null);
      },
    });
  }

  trackById = (_: number, r: any) => r?.id;
}
