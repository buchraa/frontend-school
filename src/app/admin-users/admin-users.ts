import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import {
  AdminService,
  AdminUserRow,
  CreateKind,
  CreateUserForm,
  ParentDto,
  Role,
} from '../admin/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-users.html',
})
export class AdminUsers {
  private admin = inject(AdminService);

  // ---- UI state
  search = '';
  roleFilter: Role | 'ALL' = 'ALL';

  // ---- modals
  createOpen = false;
  creating = false;
  createError: string | null = null;

  form: CreateUserForm = {
    kind: 'PARENT',
    fullName: '',
    phone: '',
    email: '',
    password: '',
  };

  // ---- refresh trigger
  private refresh$ = new BehaviorSubject<void>(undefined);

  // ---- users state
  usersState$ = this.refresh$.pipe(
    switchMap(() =>
      this.admin.listUsers().pipe(
        map((users) => ({
          loading: false,
          users,
          error: null as string | null,
        })),
        startWith({
          loading: true,
          users: [] as AdminUserRow[],
          error: null,
        }),
        catchError(() =>
          of({
            loading: false,
            users: [] as AdminUserRow[],
            error: 'Impossible de charger la liste des utilisateurs.',
          }),
        ),
      ),
    ),
  );

  // ---- view model
  vm$ = combineLatest([this.usersState$]).pipe(
    map(([usersState]) => ({
      usersState,
      filteredUsers: usersState.users.filter((u) => {
        const roleOk =
          this.roleFilter === 'ALL' || u.role === this.roleFilter;
        const text =
          ((u.fullName ?? '') + ' ' + u.email).toLowerCase();
        return roleOk && text.includes(this.search.toLowerCase());
      }),
    })),
  );

  // ================= actions =================

  refresh() {
    this.refresh$.next();
  }

  openCreate(kind: CreateKind = 'PARENT') {
    this.createError = null;
    this.form = { kind, fullName: '', phone: '', email: '', password: '' };
    this.createOpen = true;
  }

  submitCreate(): void {
    this.createError = null;

    if (!this.form.fullName.trim()){
      this.createError = 'Nom complet obligatoire.'
      return;}
    if (!this.form.email.trim()){
      this.createError = 'Email obligatoire.'
      return ;}
    if (!this.form.password.trim()){
      this.createError = 'Mot de passe obligatoire.'
      return ;}

    this.creating = true;
    this.admin.createUserByKind(this.form).subscribe({
      next: () => {
        this.creating = false;
        this.createOpen = false;
        this.refresh();
      },
      error: (e) => {
        this.creating = false;
        this.createError =
          e?.error?.message || 'Erreur création utilisateur.';
      },
    });
  }

  removeUser(u: AdminUserRow) {
    if (!confirm(`Supprimer le user ${u.email} ?`)) return;

    this.admin.deleteUser(u.id).subscribe({
      next: () => this.refresh(),
      error: (e) =>
        alert(e?.error?.message || 'Suppression impossible.'),
    });
  }

  goToProfile(u: AdminUserRow) {
    if (u.role === 'PARENT') return ['/admin/parents', u.id];
    if (u.role === 'TEACHER') return ['/admin/teachers', u.id];
    if (u.role === 'STAFF' || u.role === 'BENEVOL')
      return ['/admin/staff', u.id];
    return null;
  }

  badgeClass(role: string) {
    return {
      'bg-indigo-50 text-indigo-700': role === 'ADMIN',
      'bg-gray-100 text-gray-800': role === 'STAFF',
      'bg-green-100 text-green-800': role === 'BENEVOL',
      'bg-emerald-50 text-emerald-700': role === 'TEACHER',
      'bg-blue-50 text-blue-700': role === 'PARENT',
    };
  }
}
