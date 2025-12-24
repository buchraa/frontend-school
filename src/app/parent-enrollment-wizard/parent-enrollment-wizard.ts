import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { EnrollmentService, ParentEnrollmentItem, UpdateEnrollmentDto } from '../parent/enrollment.service';
import { toObservable } from '@angular/core/rxjs-interop';

type Vm = {
  loading: boolean;
  error: string | null;
  enrollment: ParentEnrollmentItem | null;
};

@Component({
  standalone: true,
  selector: 'app-parent-enrollment-wizard',
  imports: [CommonModule, FormsModule],
  templateUrl: './parent-enrollment-wizard.html',
})
export class ParentEnrollmentWizard {
  private svc = inject(EnrollmentService);
  private router = inject(Router);

  // trigger reload
  private reload = signal(0);
  private reload$ = toObservable(this.reload);


  saving = signal(false);
  saveError = signal<string | null>(null);

  // state local pour les "newChildren" du wizard
  newChildren = signal<Array<{ firstName: string; lastName: string; birthDate?: string; desiredLevel?: string; notes?: string }>>([]);

  // pour existing children: on modifie directement sur enrollment.children (binding)
  vm$ = this.reload$.pipe(
    switchMap(() =>
      this.svc.getCurrent().pipe(
        map((enrollment) => ({ loading: false, error: null, enrollment } as Vm)),
        startWith({ loading: true, error: null, enrollment: null } as Vm),
        catchError((e) =>
          of({
            loading: false,
            error: e?.error?.message || 'Impossible de charger votre inscription.',
            enrollment: null,
          } as Vm),
        ),
      ),
    ),
  );

  // helpers template
  hasEnrollment = (vm: Vm) => !!vm.enrollment;

  addNewChild() {
    this.newChildren.update((arr) => [...arr, { firstName: '', lastName: '', desiredLevel: '' }]);
  }

  removeNewChild(idx: number) {
    this.newChildren.update((arr) => arr.filter((_, i) => i !== idx));
  }

  refresh() {
    // technique simple: recharger en naviguant vers la même route
    // ou faire un "reload signal" si tu as un vrai subject
    this.router.navigateByUrl('/parent/enrollment/start').then(() => {
      this.router.navigateByUrl('/parent/enrollment/wizard');
    });
  }

  saveDraft(enrollment: ParentEnrollmentItem) {
    this.saveError.set(null);
    this.saving.set(true);

    const payload: UpdateEnrollmentDto = {
      existingChildren: (enrollment.children || []).map((c) => ({
        enrollmentChildId: c.id,
        desiredLevel: c.desiredLevel ?? null,
        notes: c.notes ?? null,
      })),
      newChildren: this.newChildren().map((c) => ({
        firstName: c.firstName,
        lastName: c.lastName,
        birthDate: c.birthDate ?? null,
        desiredLevel: c.desiredLevel ?? null,
        notes: c.notes ?? null,
      })),
      submit: false,
    };

    this.svc.updateCurrent(payload).subscribe({
      next: () => {
        this.saving.set(false);
        // après save, on vide les newChildren car elles sont persistées côté back
        this.newChildren.set([]);
        // on recharge l’écran
        this.refresh();
      },
      error: (e) => {
        this.saving.set(false);
        this.saveError.set(e?.error?.message || 'Erreur lors de la sauvegarde.');
      },
    });
  }

  submit(enrollment: ParentEnrollmentItem) {
    this.saveError.set(null);
    this.saving.set(true);

    // submit = PATCH current { submit:true } (ton back le gère déjà)
    const payload: UpdateEnrollmentDto = {
      existingChildren: (enrollment.children || []).map((c) => ({
        enrollmentChildId: c.id,
        desiredLevel: c.desiredLevel ?? null,
        notes: c.notes ?? null,
      })),
      newChildren: this.newChildren().map((c) => ({
        firstName: c.firstName,
        lastName: c.lastName,
        birthDate: c.birthDate ?? null,
        desiredLevel: c.desiredLevel ?? null,
        notes: c.notes ?? null,
      })),
      submit: true,
    };

    this.svc.updateCurrent(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/enrollment/success']);
      },
      error: (e) => {
        this.saving.set(false);
        this.saveError.set(e?.error?.message || 'Erreur lors de la soumission.');
      },
    });
  }
  back() {
    this.router.navigateByUrl('/parent/dashboard');
  }
  
}
