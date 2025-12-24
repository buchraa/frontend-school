import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { EnrollmentService, EnrollmentCurrent } from '../parent/enrollment.service'; // adapte le chemin si besoin
import { ParentService, FamilyBilling } from '../parent/parent.service';
type LoadState<T> = { loading: boolean; data: T; error: string | null };

// ✅ Types locaux (plus de FamilyBillingRow / PaymentRow manquants)
// Remplace/ajuste les champs si ton backend renvoie d’autres noms.
type BillingRow = {
  month: number;
  year: number;
  expectedAmount: number;
  paidAmount: number;
  status: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING';
  dueDate?: string;
};

type PaymentRow = {
  id: number;
  paymentDate: string;
  amount: number;
  method?: string;
  reference?: string;
};

type EnrollmentRow = {
  id: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_TEST' | 'VALIDATED' | 'REJECTED';
  childrenCount?: number;
  schoolYear?: { label: string };
  createdAt?: string;
};

@Component({
  standalone: true,
  selector: 'app-parent-dashboard',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './parent-dashboard.html',
})
export class ParentDashboard {
  private parent = inject(ParentService);
    private enrollment = inject(EnrollmentService);

  private router = inject(Router);

  // --- UI filters
  private now = new Date();
  private year$ = new BehaviorSubject<number>(this.now.getFullYear());
  private month$ = new BehaviorSubject<number>(this.now.getMonth() + 1);

  // Trigger refresh global
  private refresh$ = new BehaviorSubject<void>(undefined);

  // Expose pour template (ngModelChange)
  year = () => this.year$.value;
  month = () => this.month$.value;
  setYear(v: number) { this.year$.next(Number(v)); }
  setMonth(v: number) { this.month$.next(Number(v)); }
  refreshAll() { this.refresh$.next(undefined); }

  // --- FACTURES (billing)
  private billingState$ = combineLatest([this.year$, this.month$, this.refresh$]).pipe(
    switchMap(() =>
      this.parent.getMyFamilyBilling().pipe(
        map((data: FamilyBilling[]) => ({ loading: false, data, error: null }) as LoadState<BillingRow[]>),
        startWith({ loading: true, data: [] as FamilyBilling[], error: null }),
        catchError((e) =>
          of({
            loading: false,
            data: [] as FamilyBilling[],
            error: e?.error?.message || 'Impossible de charger les factures.',
          } as LoadState<FamilyBilling[]>)
        )
      )
    ),
    shareReplay(1)
  );

  // --- PAIEMENTS
  private paymentsState$ = this.refresh$.pipe(
    switchMap(() =>
      this.parent.getMyPayments().pipe(
        map((data: PaymentRow[]) => ({ loading: false, data, error: null }) as LoadState<PaymentRow[]>),
        startWith({ loading: true, data: [] as PaymentRow[], error: null }),
        catchError((e) =>
          of({
            loading: false,
            data: [] as PaymentRow[],
            error: e?.error?.message || 'Impossible de charger les paiements.',
          } as LoadState<PaymentRow[]>)
        )
      )
    ),
    shareReplay(1)
  );

  // --- INSCRIPTIONS (liste des demandes du parent)
private toArray<T>(v: T | T[] | null | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

enrollmentsState$ = this.refresh$.pipe(
  startWith(void 0),
  switchMap(() =>
    this.parent.getCurrent().pipe(
      map((data) => ({
        loading: false,
        data: this.toArray(data),         // ✅ toujours un array
        error: null,
      })),
      startWith({ loading: true, data: [] as EnrollmentCurrent[], error: null }),
      catchError((e) =>
        of({
          loading: false,
          data: [] as EnrollmentCurrent[],
          error: e?.error?.message || "Impossible de charger les inscriptions",
        })
      )
    )
  ),
  shareReplay(1)
);

  // --- VM global
  vm$ = combineLatest([this.billingState$, this.paymentsState$, this.enrollmentsState$, this.year$, this.month$]).pipe(
    map(([billingState, paymentsState, enrollmentsState, year, month]) => ({
      year,
      month,
      billingState,
      paymentsState,
      enrollmentsState,
    })),
    shareReplay(1)
  );

  // --- Actions
  startNewEnrollment() {
    this.router.navigate(['/parent/enrollment/wizard']); // adapte si ta route est différente
  }

  openEnrollment() {
    this.router.navigate(['/parent/enrollment/wizard']); // adapte
  }

  statusLabel(s: BillingRow['status']) {
    switch (s) {
      case 'PAID': return 'Payé';
      case 'PARTIAL': return 'Partiel';
      case 'OVERDUE': return 'En retard';
      default: return 'En attente';
    }
  }

   trackById = (_: number, x: { id?: number }) => x?.id ?? _;
}
