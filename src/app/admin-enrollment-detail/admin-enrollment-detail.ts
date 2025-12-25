import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { EnrollmentAdminService } from '../admin-enrollments/enrollment-admin.service'; // adapte le chemin
import { toObservable } from '@angular/core/rxjs-interop';
import { AdminService } from '../admin/admin.service';
@Component({
  selector: 'app-admin-enrollment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-enrollment-detail.html',
})
export class AdminEnrollmentDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(EnrollmentAdminService);
    private adminService = inject(AdminService);

  

  // UI
  saving = signal(false);
  errorLocal = signal<string | null>(null);

  // Draft editable (children) pour ngModel
  draftChildren = signal<any[]>([]);
  draftReady = signal(false);

  // Reload trigger
  private reload = signal(0);

  // id$ depuis la route
  private id$ = this.route.paramMap.pipe(
    map((p) => Number(p.get('id'))),
    shareReplay(1)
  );

  // request$ (recharge quand reload change)
  private request$ = combineLatest([this.id$, toObservable(this.reload)]).pipe(
    switchMap(([id]) =>
      this.service.getOne(id).pipe(
        catchError((e) => {
          this.errorLocal.set(e?.error?.message || 'Erreur lors du chargement de la demande.');
          return of(null);
        })
      )
    ),
    tap((req) => {
      // initialise draft children une seule fois après fetch
      if (req?.children) {
        // copie "safe" pour edits
        this.draftChildren.set(
          req.children.map((c: any) => ({
            ...c,
            // on garde targetClassGroupId pour envoyer au backend
            targetClassGroupId: c.targetClassGroup?.id ?? null,
          }))
        );
        this.draftReady.set(true);
      } else {
        this.draftChildren.set([]);
        this.draftReady.set(true);
      }
    }),
    shareReplay(1)
  );

  private classGroups$ = this.service.getClassGroups().pipe(
    catchError(() => of([])),
    shareReplay(1)
  );

  // VM
  vm$ = combineLatest([this.request$, this.classGroups$]).pipe(
    map(([request, classGroups]) => ({
      loading: request === undefined,
      error: this.errorLocal(),
      request,
      classGroups,
      saving: this.saving(),
    })),
    startWith({
      loading: true,
      error: null,
      request: null,
      classGroups: [],
      saving: false,
    })
  );

  back() {
    this.router.navigate(['/admin/enrollments']);
  }

  changeStatus(status: string, requestId: number) {
    this.errorLocal.set(null);
    this.saving.set(true);

    this.service.updateStatus(requestId, status).subscribe({
      next: () => {
        this.saving.set(false);
        // recharge pour être sûr d’avoir les données à jour
        this.reload.set(this.reload() + 1);
        if (status === 'VALIDATED') {
          alert('Demande validée.');
        }
      },
      error: (e) => {
        this.saving.set(false);
        this.errorLocal.set(e?.error?.message || 'Erreur lors de la mise à jour du statut.');
      },
    });
  }

saveChildAssignments() {
  this.errorLocal.set(null);
  this.saving.set(true);

  // 1️⃣ regrouper par groupId
  const byGroup = new Map<number, number[]>();

  for (const c of this.draftChildren()) {
    if (!c.targetClassGroupId) continue;

    if (!byGroup.has(c.targetClassGroupId)) {
      byGroup.set(c.targetClassGroupId, []);
    }

    byGroup.get(c.targetClassGroupId)!.push(c.id); 
    // ⚠️ c.id doit être EnrollmentChildId
  }

  // 2️⃣ appels API (1 appel par groupe)
  const calls = Array.from(byGroup.entries()).map(
    ([groupId, childIds]) =>
      this.adminService.addStudentsToGroup(groupId, childIds)
  );

  forkJoin(calls).subscribe({
    next: () => {
      this.saving.set(false);
      alert('Affectations enregistrées');
      this.reload.set(this.reload() + 1);
    },
    error: (e) => {
      this.saving.set(false);
      this.errorLocal.set(e.error?.message ?? 'Erreur serveur');
    },
  });
}


  // helper pour select: quand l’utilisateur choisit un group (id), on le met dans draft

setChildGroup(index: number, groupId: number | null) {
  const children = [...this.draftChildren()];
  children[index] = {
    ...children[index],
    targetClassGroupId: groupId,
  };

  this.draftChildren.set(children);

  console.log('Child', children[index].id, '-> groupId', groupId);
}
 
}
