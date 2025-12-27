import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

//type ImportBankLine = { reference: string; amount: number; date: string };

registerLocaleData(localeFr);


import {
  StaffService,
  BillingStatus,
  Payment,
  ImportBankLine,
  ImportBankResult,
} from '../staff/staff.service';

type LoadState<T> = { loading: boolean; data: T; error: string | null };

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './staff-dashboard.html',
})
export class StaffDashboard {
  private staff = inject(StaffService);
  private cdr = inject(ChangeDetectorRef);

  // ======= UI state (reactive)
  private year$ = new BehaviorSubject<number>(new Date().getFullYear());
  private month$ = new BehaviorSubject<number>(new Date().getMonth() + 1);

  private familyFilter$ = new BehaviorSubject<string>('');
  private statusFilter$ = new BehaviorSubject<BillingStatus['status'] | 'ALL'>('ALL');

  private refresh$ = new BehaviorSubject<void>(undefined);

  // ======= Import state
  isDragging = false;
  importing = false;
  importError: string | null = null;
  importLines: ImportBankLine[] = [];
  importResults: ImportBankResult[] = [];

  // import manuel
  newLine: ImportBankLine = {
    reference: '',
    amount: 0,
    date: new Date().toISOString().substring(0, 10),
  };

  // ======= Loaders
  private billingStatusState$ = combineLatest([this.year$, this.month$, this.refresh$]).pipe(
    switchMap(([year, month]) =>
      this.staff.getBillingStatus(year, month).pipe(
        map((data) => ({ loading: false, data, error: null } as LoadState<BillingStatus[]>)),
        startWith({ loading: true, data: [] as BillingStatus[], error: null } as LoadState<BillingStatus[]>),
        catchError((e) =>
          of({
            loading: false,
            data: [] as BillingStatus[],
            error: e?.error?.message || 'Erreur chargement statut facturation.',
          } as LoadState<BillingStatus[]>),
        ),
      ),
    ),
    shareReplay(1),
  );

  private overdueState$ = combineLatest([this.year$, this.month$, this.refresh$]).pipe(
    switchMap(([year, month]) =>
      this.staff.getOverdue(year, month).pipe(
        map((data) => ({ loading: false, data, error: null } as LoadState<BillingStatus[]>)),
        startWith({ loading: true, data: [] as BillingStatus[], error: null } as LoadState<BillingStatus[]>),
        catchError((e) =>
          of({
            loading: false,
            data: [] as BillingStatus[],
            error: e?.error?.message || 'Erreur chargement retards.',
          } as LoadState<BillingStatus[]>),
        ),
      ),
    ),
    shareReplay(1),
  );

  private paymentsState$ = this.refresh$.pipe(
    switchMap(() =>
      this.staff.getAllPayments().pipe(
        map((data) => ({ loading: false, data, error: null } as LoadState<Payment[]>)),
        startWith({ loading: true, data: [] as Payment[], error: null } as LoadState<Payment[]>),
        catchError((e) =>
          of({
            loading: false,
            data: [] as Payment[],
            error: e?.error?.message || 'Erreur chargement paiements.',
          } as LoadState<Payment[]>),
        ),
      ),
    ),
    shareReplay(1),
  );

  // ======= VM (avec filtres)
  vm$ = combineLatest([
    this.year$,
    this.month$,
    this.familyFilter$,
    this.statusFilter$,
    this.billingStatusState$,
    this.overdueState$,
    this.paymentsState$,
  ]).pipe(
    map(([year, month, familyFilter, statusFilter, billingState, overdueState, paymentsState]) => {
      const ff = (familyFilter || '').toLowerCase().trim();

      const filterBilling = (list: BillingStatus[]) =>
        list.filter((b) => {
          const matchFamily =
            !ff ||
            (b.parent?.familyCode || '').toLowerCase().includes(ff) ||
            (b.parent?.fullName || '').toLowerCase().includes(ff);

          const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
          return matchFamily && matchStatus;
        });

      return {
        year,
        month,
        familyFilter,
        statusFilter,

        billingState,
        overdueState,
        paymentsState,

        filteredBillingStatus: filterBilling(billingState.data),
        filteredOverdue: filterBilling(overdueState.data),
      };
    }),
    shareReplay(1),
  );

  // ===================== setters UI =====================
  setYear(v: number) {
    this.year$.next(Number(v));
  }
  setMonth(v: number) {
    this.month$.next(Number(v));
  }
  setFamilyFilter(v: string) {
    this.familyFilter$.next(v ?? '');
  }
  setStatusFilter(v: BillingStatus['status'] | 'ALL') {
    this.statusFilter$.next(v);
  }

  refreshAll() {
    this.refresh$.next();
  }

  // ===================== status UI helpers =====================
  getStatusLabel(status: BillingStatus['status']): string {
    switch (status) {
      case 'PAID':
        return 'Payé';
      case 'PARTIAL':
        return 'Partiel';
      case 'OVERDUE':
        return 'En retard';
      case 'PENDING':
      default:
        return 'En attente';
    }
  }

  // ===================== import helpers =====================
  addImportLine(): void {
    if (!this.newLine.reference || !this.newLine.amount || !this.newLine.date) return;

    this.importLines = [...this.importLines, { ...this.newLine }];

    this.newLine = {
      reference: '',
      amount: 0,
      date: new Date().toISOString().substring(0, 10),
    };
  }

  clearImportLines(): void {
    this.importLinesSubject.next([]);
    this.importResults = [];
    this.importError = null;
    this.importing = false;
    this.importDone = false;

  }

  submitImport(): void {
    if (this.importing || this.importDone) {
      return;
    }
    const lines = this.importLinesSubject.value;
    console.log('Lines', lines);

    if (!lines.length) {
      console.log('KO');
      this.importError = 'Aucune ligne à importer.';
      return;
    }
    this.importing = true;

    this.importError = null;

    this.staff.importBank(lines).subscribe({
      next: (results) => {
        console.log('OK', results);
        this.importResults = results;
        this.importing = false;
        this.importDone = true;

        this.importingSubject.next(true);
        this.refreshAll();
      },
      error: (err) => {
        console.error(err);
        this.importErrorSubject.next(err?.error?.message || 'Erreur lors de l’import.');
        this.importingSubject.next(false);
        this.importing = false;

      },
    });
  }

  // ===================== Drag & Drop CSV =====================
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.processFileNext(input.files[0]);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (!event.dataTransfer?.files?.length) return;
    this.processFileNext(event.dataTransfer.files[0]);
  }

  /*private processFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.importError = 'Merci de sélectionner un fichier CSV (.csv)';
      this.cdr.markForCheck();
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result ?? '');
      try {
        const lines = this.parseCsvToImportLines(text);
        this.importLines = lines;
        this.importResults = [];
        this.importError = null;
      } catch (e) {
        console.error(e);
        this.importError = 'Erreur lors du parsing du fichier CSV.';
      }
    };

    reader.onerror = () => {
      this.importError = 'Impossible de lire le fichier.';
    };

    reader.readAsText(file, 'utf-8');
  }*/

  private parseCsvToImportLines(text: string): ImportBankLine[] {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l);

    if (!lines.length) return [];

    const separator = lines[0].includes(';') ? ';' : ',';
    const startIndex = lines[0].toLowerCase().includes('reference') ? 1 : 0;

    const result: ImportBankLine[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const row = lines[i].split(separator);
      if (row.length < 3) continue;

      const reference = row[0].trim();
      const amount = Number(row[1].replace(',', '.').trim());
      const date = row[2].trim();

      if (!reference || Number.isNaN(amount) || !date) continue;

      result.push({ reference, amount, date });
    }

    return result;
  }

  /** New version 
   * 
   *  importError: string | null = null;
  importLines: ImportBankLine[] = [];
  importResults: ImportBankResult[] = [];
   * 
  */

  private zone = inject(NgZone);

  private importLinesSubject = new BehaviorSubject<ImportBankLine[]>([]);
  importLines$ = this.importLinesSubject.asObservable();

  private importErrorSubject = new BehaviorSubject<string | null>(null);
  importError$ = this.importErrorSubject.asObservable();

  private importingSubject = new BehaviorSubject<boolean>(false);
  importing$ = this.importingSubject.asObservable();

  vmImport$ = combineLatest([this.importLines$, this.importError$, this.importing$]).pipe(
    map(([lines, error, importing]) => ({ lines, error, importing }))
  );

  private processFileNext(file: File): void {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.importErrorSubject.next('Merci de sélectionner un fichier CSV (.csv)');
      this.importLinesSubject.next([]);
      return;
    }

    this.importingSubject.next(true);
    this.importErrorSubject.next(null);

    const reader = new FileReader();

    reader.onload = () => {
      // ✅ force Angular à “voir” les changements
      this.zone.run(() => {
        try {
          const text = String(reader.result ?? '');
          const lines = this.parseCsvToImportLines(text);

          this.importLinesSubject.next(lines);
          this.importErrorSubject.next(null);
          this.importResults = [];

        } catch (e) {
          console.error(e);
          this.importLinesSubject.next([]);
          this.importErrorSubject.next('Erreur lors du parsing du CSV');
        } finally {
          this.importingSubject.next(false);
        }
      });
    };

    reader.onerror = () => {
      this.zone.run(() => {
        this.importLinesSubject.next([]);
        this.importErrorSubject.next('Erreur lecture fichier');
        this.importingSubject.next(false);
      });
    };

    reader.readAsText(file);
  }

  importDone = false;

year = new Date().getFullYear();
month = new Date().getMonth() + 1;
loading = false;
msg = '';

    generate() {
  this.loading = true;
  this.msg = '';
  console.log(this.year, this.month)
  this.staff.generateBilling(this.year, this.month).subscribe({
    next: () => {
      this.loading = false;
      this.msg = 'Factures générées avec succès.';
    },
    error: (e) => {
      this.loading = false;
      this.msg = e?.error?.message || 'Erreur génération.';
    }
  });
}

}
