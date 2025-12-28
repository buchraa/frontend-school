import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PublicAuthLayout } from '../public-layout/public-layout';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PublicAuthLayout],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);

  loading = signal(false);
  done = signal(false);
  error = signal<string | null>(null);

  token = this.route.snapshot.queryParamMap.get('token');

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', [Validators.required]],
  });

  submit() {
    this.error.set(null);

    if (!this.token) {
      this.error.set('Lien invalide (token manquant).');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword, confirm } = this.form.value;

    if (newPassword !== confirm) {
      this.error.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.loading.set(true);

    this.http.post('http://localhost:3000/auth/reset-password', {
      token: this.token,
      newPassword,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.done.set(true);
        setTimeout(() => this.router.navigate(['/login']), 800);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message || 'Token invalide ou expiré.');
      },
    });
  }

  get password() {
    return this.form.get('password');
  }
  get confirm() {
    return this.form.get('confirm');
  }
}

