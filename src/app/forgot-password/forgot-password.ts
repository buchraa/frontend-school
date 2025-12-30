import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PublicAuthLayout } from '../public-layout/public-layout';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PublicAuthLayout],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
   private readonly API_URL = environment.apiUrl;

  loading = signal(false);
  sent = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit() {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.http.post(`${this.API_URL}/auth/forgot-password`, {
      email: this.form.value.email,
    }).subscribe({
      next: () => {
        this.sent.set(true);
        this.loading.set(false);
      },
      error: (e) => {
        // On garde le même message UX, mais on peut log en console si besoin
        this.loading.set(false);
        this.sent.set(true); // sécurité: même résultat même si email inconnu
      },
    });
  }

  get email() {
    return this.form.get('email');
  }
}
