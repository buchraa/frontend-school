import { Component } from '@angular/core';
import { EnrollmentService } from '../parent/enrollment.service';
import { CreatePublicEnrollmentDto } from '../parent/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-public-enrollment',
imports: [CommonModule, FormsModule],
  templateUrl: './public-enrollment.html',
  styleUrl: './public-enrollment.css',
})
export class PublicEnrollment {

  submitting = false;
  error: string | null = null;
  success = false;

  form: CreatePublicEnrollmentDto = {
    parent: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
    },
    children: [],
  };

  newChild = {
    firstName: '',
    lastName: '',
    birthDate: '',
    desiredLevel: '',
    notes: '',
  };

  constructor(private enrollment: EnrollmentService, private auth: AuthService, private router: Router) {}

  addChild() {
    if (!this.newChild.firstName || !this.newChild.lastName) return;

    this.form.children.push({ ...this.newChild });
    this.newChild = {
      firstName: '',
      lastName: '',
      birthDate: '',
      desiredLevel: '',
      notes: '',
    };
  }

  removeChild(i: number) {
    this.form.children.splice(i, 1);
  }




submit() {
  this.error = null;

  if (!this.form.parent.fullName || !this.form.parent.email || !this.form.parent.password) {
    this.error = 'Veuillez renseigner les infos du parent.';
    return;
  }
  if (!this.form.children.length) {
    this.error = 'Ajoutez au moins un enfant.';
    return;
  }

  this.submitting = true;

  this.enrollment.createPublicEnrollment(this.form).subscribe({
    next: () => {
      // ✅ login auto
      this.auth.login(this.form.parent.email, this.form.parent.password).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/enrollment/success']);
        },
        error: () => {
          // fallback : inscription OK mais login KO
          this.submitting = false;
          this.router.navigate(['/login']);
        }
      });
    },
    error: (e) => {
      this.submitting = false;
      this.error = e?.error?.message || 'Erreur lors de l’inscription.';
    },
  });
}


}
