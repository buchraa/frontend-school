import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService, ClassGroup, TeacherLite, StudentLite } from '../admin/admin.service';
import { BehaviorSubject, catchError, combineLatest, debounceTime, distinctUntilChanged, map, of, shareReplay, startWith, Subject, switchMap, tap, withLatestFrom } from 'rxjs';

type Vm = {
  loading: boolean;
  error: string | null;
  groupId: number;
  group: ClassGroup | null;     
  teachers: TeacherLite[];       
  //students: StudentLite[];       
  saving: boolean;
  saveError: string | null;
};


@Component({
  selector: 'app-admin-class-group-detail',
imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-class-group-detail.html',
  })
export class AdminClassGroupDetail {
private admin = inject(AdminService);
  private route = inject(ActivatedRoute);

  // --- source groupId
  private groupId$ = this.route.paramMap.pipe(
    map(p => Number(p.get('id'))),
    shareReplay(1)
  );

  // --- refresh trigger (au lieu de reload())
  private refresh$ = new BehaviorSubject<void>(undefined);

  // --- UI fields (bindables)
  selectedTeacherId: number | null = null;
  studentSearch = '';

  // --- events (actions)
  private addTeacherClick$ = new Subject<void>();
  private addStudentClick$ = new Subject<StudentLite>();
  private removeStudentClick$ = new Subject<number>();

  // --- group load
  groupState$ = combineLatest([this.groupId$, this.refresh$]).pipe(
    switchMap(([id]) =>
      this.admin.getClassGroup(id).pipe(
        map(group => ({ loading: false, group, error: null as string | null })),
        startWith({ loading: true, group: null as any, error: null as string | null }),
        catchError(e =>
          of({ loading: false, group: null as any, error: e?.error?.message || 'Erreur chargement groupe' })
        )
      )
    ),
    shareReplay(1)
  );

  // --- teachers list (si tu l’as)
  teachersState$ = this.refresh$.pipe(
    switchMap(() =>
      this.admin.listTeachers().pipe(
        map((teachers: TeacherLite[]) => ({ loading: false, teachers, error: null as string | null })),
        startWith({ loading: true, teachers: [] as TeacherLite[], error: null as string | null }),
        catchError(e =>
          of({ loading: false, teachers: [] as TeacherLite[], error: e?.error?.message || 'Erreur chargement enseignants' })
        )
      )
    ),
    shareReplay(1)
  );

  // --- student search results (reactif)
  private studentSearch$ = new BehaviorSubject<string>('');
  setSearch(q: string) {
    this.studentSearch = q;
    this.studentSearch$.next(q);
  }

  searchState$ = this.studentSearch$.pipe(
    map(q => q.trim()),
    debounceTime(200),
    distinctUntilChanged(),
    switchMap(q => {
      if (!q) return of({ loading: false, results: [] as StudentLite[], error: null as string | null });
      return this.admin.searchStudents(q).pipe(
        map((results: StudentLite[]) => ({ loading: false, results, error: null as string | null })),
        startWith({ loading: true, results: [] as StudentLite[], error: null as string | null }),
        catchError(e =>
          of({ loading: false, results: [] as StudentLite[], error: e?.error?.message || 'Erreur recherche élèves' })
        )
      );
    }),
    shareReplay(1)
  );

  // -------------------------
  // ACTIONS réactives
  // -------------------------

  // 1) addTeacher
  private addTeacherEffect$ = this.addTeacherClick$.pipe(
    withLatestFrom(this.groupState$, this.groupId$),
    switchMap(([_, gs, groupId]) => {
      const group = gs.group;
      const teacherId = this.selectedTeacherId;

      if (!group || !teacherId) return of(null);

      const current = (group.teachers ?? []).map((t: any) => t.id);
      const next = Array.from(new Set([...current, teacherId]));

      return this.admin.setGroupTeachers(groupId, next).pipe(
        tap(() => {
          this.selectedTeacherId = null;
          this.refresh$.next();
        }),
        catchError(e => {
          alert(e?.error?.message || 'Erreur affectation enseignants');
          return of(null);
        })
      );
    }),
    shareReplay(1)
  );

  // 2) addStudent
  private addStudentEffect$ = this.addStudentClick$.pipe(
    withLatestFrom(this.groupId$),
    switchMap(([student, groupId]) =>
      this.admin.addStudentsToGroup(groupId, [student.id]).pipe(
        tap(() => {
          // reset search UI
          this.setSearch('');
          this.refresh$.next();
        }),
        catchError(e => {
          alert(e?.error?.message || 'Erreur ajout élève');
          return of(null);
        })
      )
    ),
    shareReplay(1)
  );

  // 3) removeStudent
  private removeStudentEffect$ = this.removeStudentClick$.pipe(
    withLatestFrom(this.groupId$),
    switchMap(([studentId, groupId]) =>
      this.admin.removeStudentFromGroup(groupId, studentId).pipe(
        tap(() => this.refresh$.next()),
        catchError(e => {
          alert(e?.error?.message || 'Erreur retrait élève');
          return of(null);
        })
      )
    ),
    shareReplay(1)
  );

  // (on “active” les effects)
  private _effects = combineLatest([
    this.addTeacherEffect$,
    this.addStudentEffect$,
    this.removeStudentEffect$,
  ]).subscribe();

  // VM unique pour le template
  vm$ = combineLatest([this.groupState$, this.teachersState$, this.searchState$]).pipe(
    map(([groupState, teachersState, searchState]) => ({ groupState, teachersState, searchState })),
    shareReplay(1)
  );

  // handlers template
  refresh() { this.refresh$.next(); }
  addTeacher() { this.addTeacherClick$.next(); }
  addStudent(s: StudentLite) { this.addStudentClick$.next(s); }
  removeStudent(studentId: number) { this.removeStudentClick$.next(studentId); }

  trackById = (_: number, x: { id: number }) => x.id;

}
