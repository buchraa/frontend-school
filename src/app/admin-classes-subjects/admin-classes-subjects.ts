import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { AdminService } from '../admin/admin.service';

// Ajuste ces types si tu les as déjà
type SchoolYearLite = { id: number; label: string; isActive: boolean };
type ClassGroupLite = {
  id: number;
  code: string;
  label?: string;
  level?: string;
  maxStudents?: number;
  teachers?: { id:number; fullName:string }[];
  students?: { id:number; fullName:string; studentRef?:string|null }[];
  studentsCount?: number;
  schoolYear?: { id: number; label: string };
};

export interface ClassGroup {
  id: number;
  code: string;
  label?: string | null;
  level?: string | null;
  maxStudents?: number | null;
  teachers?: { id:number; fullName:string }[];
  students?: { id:number; fullName:string; studentRef?:string|null }[];
}

@Component({
  selector: 'app-admin-classes-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-classes-subjects.html',
})
export class AdminClassesSubjects {
  private admin = inject(AdminService);

  // --- UI state (form)
  form = {
    code: '',
    label: '',
    level: '',
    maxStudents: undefined as number | undefined,
  };

  // --- Filters
  private selectedYearId$ = new BehaviorSubject<number | undefined>(undefined);
  set selectedYearId(v: number | undefined) {
    this.selectedYearId$.next(v);
  }
  get selectedYearId(): number | undefined {
    return this.selectedYearId$.value;
  }

  // --- Manual refresh trigger
  private refresh$ = new BehaviorSubject<void>(undefined);

  // --- Load years
  private yearsState$ = this.refresh$.pipe(
    switchMap(() =>
      this.admin.getSchoolYears().pipe(
        // si ton API renvoie un tableau, supprime le map ci-dessous
        map((ys: any) => (Array.isArray(ys) ? ys : [ys]) as SchoolYearLite[]),
        tap((years) => {
          // Auto-select active year only once (si rien n’est choisi)
          if (this.selectedYearId$.value == null) {
            const active = years.find((y) => y.isActive);
            if (active) this.selectedYearId$.next(active.id);
          }
        }),
        map((years) => ({ loading: false, years, error: null as string | null })),
        startWith({ loading: true, years: [] as SchoolYearLite[], error: null as string | null }),
        catchError((e) =>
          of({
            loading: false,
            years: [] as SchoolYearLite[],
            error: e?.error?.message || 'Erreur chargement années scolaires',
          }),
        ),
      ),
    ),
    shareReplay(1),
  );

  // --- Load groups (depends on selected year + refresh)
  private groupsState$ = combineLatest([this.refresh$, this.selectedYearId$]).pipe(
    switchMap(([_]) =>
      this.admin.getClassGroups().pipe(
        map((groups: any) => ({ loading: false, groups: (groups ?? []) as ClassGroupLite[], error: null as string | null })),
        startWith({ loading: true, groups: [] as ClassGroupLite[], error: null as string | null }),
        catchError((e) =>
          of({
            loading: false,
            groups: [] as ClassGroupLite[],
            error: e?.error?.message || 'Erreur chargement groupes',
          }),
        ),
      ),
    ),
    shareReplay(1),

  );

  // --- VM
  vm$ = combineLatest([this.yearsState$, this.groupsState$, this.selectedYearId$]).pipe(
    map(([yearsState, groupsState, selectedYearId]) => ({
      yearsState,
      groupsState,
      selectedYearId,
      canCreate: !!selectedYearId && !!this.form.code.trim(),
    })),
    shareReplay(1),
  );

  // --- Actions
  refresh() {
    this.refresh$.next();
  }

  onYearChange(idStr: any) {
    const id = idStr ? Number(idStr) : undefined;
    this.selectedYearId = Number.isFinite(id as number) ? (id as number) : undefined;
    this.refresh();
  }

  createGroup() {
    const schoolYearId = this.selectedYearId;
    if (!schoolYearId) return;
    if (!this.form.code.trim()) return;

    const payload = {
      code: this.form.code.trim(),
      label: this.form.label?.trim() || undefined,
      level: this.form.level?.trim() || undefined,
      maxStudents: this.form.maxStudents,
      schoolYearId,
    };

    this.admin.createClassGroup(payload).subscribe({
      next: () => {
        this.form = { code: '', label: '', level: '', maxStudents: undefined };
        this.refresh();
      },
      error: (e) => alert(e?.error?.message || 'Erreur création groupe'),
    });
  }

  trackById = (_: number, x: { id: number }) => x.id;
}
