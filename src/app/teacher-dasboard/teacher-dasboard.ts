import { inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TeacherService, TeacherClassLite, StudentLite, AdminUserRow }  from '../teacher/teacher.service';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
@Component({
  selector: 'app-teacher-dasboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-dasboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  /*template: `
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">Mes classes</h1>

   @if(loading) {<div class="text-sm text-gray-500">Chargement...</div>

    @if(!loading && classes.length === 0) {<div  class="text-sm text-gray-500">
      Aucune classe affectée.
    </div>}

     @if(loading) { <div class="grid gap-3 md:grid-cols-2">
    @for (c of classes; track $index) {  <a 
         class="block bg-white rounded shadow p-4 hover:bg-gray-50"
         [routerLink]="['/teacher/classes', c.id]">
        <div class="flex justify-between items-center">
          <div>
            <div class="font-semibold">{{ c.code }} — {{ c.label }}</div>
            <div class="text-sm text-gray-600">Niveau : {{ c.level }}</div>
          </div>
          <div class="text-sm text-gray-700">
            {{ c.studentsCount }} élève(s)
          </div>
        </div>
      </a>} 
    </div> }}
  </div>
  `,*/
  })

export class TeacherDasboard  {
private selectedClassId$ = new BehaviorSubject<number | null>(null);
  private teacher = inject(TeacherService);

 
 users$ = this.teacher.getProfil().pipe(
    catchError(() => of([])),
    shareReplay(1)
  );
  currentUser$ = this.teacher.getProfil().pipe(
    map((user) => ({ loading: false, user, error: null as string | null })),
    startWith({ loading: true, user : {}  as  AdminUserRow, error: null }),
    catchError((e) =>
      of({ loading: false, user: {} as AdminUserRow, error: e?.error?.message || 'Erreur chargement' })
    ),
    shareReplay(1)
  );

  classesState$ = this.teacher.getMyClasses().pipe(
    map((classes) => ({ loading: false, classes, error: null as string | null })),
    startWith({ loading: true, classes: [] as TeacherClassLite[], error: null }),
    catchError((e) =>
      of({ loading: false, classes: [] as TeacherClassLite[], error: e?.error?.message || 'Erreur chargement classes' })
    ),
    shareReplay(1)
  );

  studentsState$ = this.selectedClassId$.pipe(
    switchMap((id) => {
      if (!id) return of({ loading: false, students: [] as StudentLite[], error: null as string | null });

      return this.teacher.getClassStudents(id).pipe(
        map((students) => ({ loading: false, students, error: null as string | null })),
        startWith({ loading: true, students: [] as StudentLite[], error: null }),
        catchError((e) => of({ loading: false, students: [], error: e?.error?.message || 'Erreur chargement élèves' })),
      );
    }),
    shareReplay(1)
  );

  vm$ = combineLatest([this.classesState$, this.studentsState$, this.selectedClassId$]).pipe(
    map(([classesState, studentsState, selectedId]) => ({ classesState, studentsState, selectedId }))
  );


  selectClass(id: number) {
    this.selectedClassId$.next(id);
  }


  

  
    logout() {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }

  trackById = (_: number, x: { id: number }) => x.id;  
}

