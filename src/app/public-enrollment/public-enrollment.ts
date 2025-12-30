import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize, map, of, switchMap } from 'rxjs';

import { EnrollmentService } from '../parent/enrollment.service';
import { CreatePublicEnrollmentDto } from '../parent/models';
import { AuthService } from '../auth/auth.service';

type Vm = {
  submitting: boolean;
  error: string | null;
  success: boolean;
};

type LevelOption = { value: string; label: string };

@Component({
  selector: 'app-public-enrollment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-enrollment.html',
  styleUrl: './public-enrollment.css',
})
export class PublicEnrollment {
  private enrollment = inject(EnrollmentService);
  private auth = inject(AuthService);
  private router = inject(Router);

  // VM
  vm: Vm = {
    submitting: false,
    error: null,
    success: false,
  };

  levels: LevelOption[] = [
    { value: 'DEBUTANT', label: 'Débutant' },
    { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
    { value: 'AVANCE', label: 'Avancé' },
  ];

  form: CreatePublicEnrollmentDto = {
    parent: { fullName: '', email: '', phone: '', password: '' },
    children: [],
  };

  newChild = {
    firstName: '',
    lastName: '',
    birthDate: '',
    desiredLevel: '',
    notes: '',
  };

  private normalizeEmail(v: string) {
    return (v || '').trim().toLowerCase();
  }
  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  addChild() {
    this.vm.error = null;

    const firstName = (this.newChild.firstName || '').trim();
    const lastName = (this.newChild.lastName || '').trim();
    const desiredLevel = (this.newChild.desiredLevel || '').trim();

    if (!firstName || !lastName) {
      this.vm.error = "Prénom et nom de l'enfant sont obligatoires.";
      return;
    }
    if (!desiredLevel) {
      this.vm.error = 'Veuillez choisir un niveau souhaité.';
      return;
    }

    this.form.children.push({
      ...this.newChild,
      firstName,
      lastName,
      desiredLevel,
      notes: (this.newChild.notes || '').trim(),
    });

    this.newChild = { firstName: '', lastName: '', birthDate: '', desiredLevel: '', notes: '' };
  }

  removeChild(i: number) {
    this.form.children.splice(i, 1);
  }

  submit():void {
    if (this.vm.submitting) return;
    this.vm.error = null;

    // normalize
   // normalize
    this.form.parent.fullName = (this.form.parent.fullName || '').trim();
    this.form.parent.email = (this.form.parent.email || '').trim().toLowerCase();
    this.form.parent.phone = (this.form.parent.phone || '').trim();
    this.form.parent.password = (this.form.parent.password || '').trim();

    // validate
    if (!this.form.parent.fullName) {
      this.vm.error = 'Veuillez renseigner le nom complet du parent.';
      return;
    }
    if (!this.form.parent.email) {
      this.vm.error = 'Veuillez renseigner un email.';
      return;
    }
    if (!this.form.parent.password || this.form.parent.password.length < 6) {
      this.vm.error = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }
    if (!this.form.children.length) {
      this.vm.error = 'Ajoutez au moins un enfant.';
      return;
    }
    this.vm.submitting = true;

    // 1) create enrollment
   this.enrollment
      .createPublicEnrollment(this.form)
      .pipe(
        // auto-login après création
        switchMap(() =>
          this.auth.login(this.form.parent.email, this.form.parent.password).pipe(
            // si login KO, on ne bloque pas : on redirige vers /login
            catchError(() => of(null))
          )
        ),
        finalize(() => (this.vm.submitting = false)),
        catchError((e) => {
          this.vm.error = e?.error?.message || 'Erreur lors de l’inscription.';
          return EMPTY;
        })
      )
      .subscribe((loginResult) => {
        if (loginResult) {
          this.router.navigate(['/enrollment/success']);
        } else {
          this.router.navigate(['/auth/login']);
        }
      });
  }
}
