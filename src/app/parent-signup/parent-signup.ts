// parent-signup.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const FAMILY_CODE_REGEX = /^F\d{2}-\d{3}$/i; // ex: F25-009 (tu peux assouplir si besoin)

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-parent-signup',
  template: `
    <div class="card">
      <h2>Créer mon espace parent</h2>
      <p class="hint">
        Munissez-vous de votre référence famille (ex: <b>F25-009</b>) et du téléphone déclaré à l’école.
        Astuce: on compare les <b>4 derniers chiffres</b>.
      </p>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>Référence famille (familyCode)</label>
        <input
          type="text"
          formControlName="familyCode"
          placeholder="F25-009"
          (input)="upperFamilyCode()"
        />
        <div class="err" *ngIf="showErr('familyCode')">
          <span *ngIf="form.controls.familyCode.errors?.['required']">Référence obligatoire.</span>
          <span *ngIf="form.controls.familyCode.errors?.['pattern']">Format attendu: F25-009.</span>
        </div>

        <label>Téléphone (4 derniers chiffres acceptés)</label>
        <input
          type="text"
          formControlName="phone"
          placeholder="ex: 0700 ou 771234567"
          inputmode="numeric"
        />
        <div class="err" *ngIf="showErr('phone')">
          <span *ngIf="form.controls.phone.errors?.['required']">Téléphone obligatoire.</span>
          <span *ngIf="form.controls.phone.errors?.['minlength']">Saisir au moins 4 chiffres.</span>
        </div>

        <label>Email</label>
        <input type="email" formControlName="email" placeholder="ex: parent@email.com" />
        <div class="err" *ngIf="showErr('email')">
          <span *ngIf="form.controls.email.errors?.['required']">Email obligatoire.</span>
          <span *ngIf="form.controls.email.errors?.['email']">Email invalide.</span>
        </div>

        <label>Mot de passe</label>
        <input type="password" formControlName="password" placeholder="min 6 caractères" />
        <div class="err" *ngIf="showErr('password')">
          <span *ngIf="form.controls.password.errors?.['required']">Mot de passe obligatoire.</span>
          <span *ngIf="form.controls.password.errors?.['minlength']">Min 6 caractères.</span>
        </div>

        <label>Confirmer mot de passe</label>
        <input type="password" formControlName="confirmPassword" />
        <div class="err" *ngIf="showConfirmErr()">
          <span *ngIf="form.controls.confirmPassword.errors?.['required']">Confirmation obligatoire.</span>
          <span *ngIf="form.errors?.['passwordMismatch']">Les mots de passe ne correspondent pas.</span>
        </div>

        <div class="api-err" *ngIf="apiError()">{{ apiError() }}</div>
        <div class="ok" *ngIf="success()">{{ success() }}</div>

        <button type="submit" [disabled]="loading() || form.invalid">
          {{ loading() ? 'Création...' : 'Créer mon compte' }}
        </button>

        <button type="button" class="link" (click)="goLogin()">
          J’ai déjà un compte → Se connecter
        </button>
      </form>
    </div>
  `,
  styles: [`
    .card { max-width: 520px; margin: 24px auto; padding: 16px; border: 1px solid #ddd; border-radius: 10px; }
    label { display:block; margin-top: 12px; font-weight: 600; }
    input { width:100%; padding:10px; margin-top:6px; }
    .err { color:#b00020; font-size: 13px; margin-top: 4px; }
    .api-err { margin-top: 12px; color:#b00020; }
    .ok { margin-top: 12px; color: #0a7a2f; }
    button { margin-top: 16px; width: 100%; padding: 10px; }
    .link { background: transparent; border: none; text-decoration: underline; cursor: pointer; }
    .hint { color:#444; font-size: 14px; }
  `]
})
export class ParentSignup {
  private fb = inject(FormBuilder);
  private api = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  apiError = signal<string | null>(null);
  success = signal<string | null>(null);

  form = this.fb.group(
    {
      familyCode: ['', [Validators.required, Validators.pattern(FAMILY_CODE_REGEX)]],
      phone: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [this.passwordMatchValidator] }
  );

  upperFamilyCode() {
    const v = this.form.controls.familyCode.value ?? '';
    this.form.controls.familyCode.setValue(v.toUpperCase(), { emitEvent: false });
  }

  passwordMatchValidator(group: any) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p && c && p !== c ? { passwordMismatch: true } : null;
  }

  showErr(name: keyof typeof this.form.controls) {
    const c = this.form.controls[name];
    return (c.touched || c.dirty) && !!c.errors;
  }

  showConfirmErr() {
    const c = this.form.controls.confirmPassword;
    return (c.touched || c.dirty) && (!!c.errors || !!this.form.errors?.['passwordMismatch']);
  }

  submit() {
    this.apiError.set(null);
    this.success.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Nettoyage : familyCode uppercase sans espaces
    const familyCode = (this.form.value.familyCode ?? '').trim().toUpperCase().replace(/\s+/g, '');
    // Phone: garder chiffres seulement
    const phone = (this.form.value.phone ?? '').replace(/\D/g, '');
    const email = (this.form.value.email ?? '').trim().toLowerCase();
    const password = this.form.value.password ?? '';

    this.loading.set(true);
    this.api.parentSignup({ familyCode, phone, email, password })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          // si ton backend renvoie token + user : stocke puis redirige
          // localStorage.setItem('accessToken', res.accessToken);
          this.success.set('Compte créé avec succès. Redirection...');
          setTimeout(() => this.router.navigateByUrl('/parent'), 600);
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Erreur lors de la création du compte.';
          this.apiError.set(Array.isArray(msg) ? msg.join(' | ') : msg);
        },
      });
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }
}
