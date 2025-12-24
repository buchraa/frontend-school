import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import {
  AdminService,
  AdminUserRow,
  CreateKind,
  CreateUserForm,
  ParentDto,
  Role,
} from '../admin/admin.service';

type Vm = {
  loading: boolean;
  error: string | null;
  users: AdminUserRow[];
  filtered: AdminUserRow[];
  search: string;
  roleFilter: Role | 'ALL';
};

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-users.html',
})
export class AdminUsers {
  private admin = inject(AdminService);

 // UI state
  private refresh$ = new BehaviorSubject<void>(undefined);
  private search$ = new BehaviorSubject<string>('');
  private roleFilter$ = new BehaviorSubject<Role | 'ALL'>('ALL');

  // modal create user
  createOpen$ = new BehaviorSubject<boolean>(false);
  creating$ = new BehaviorSubject<boolean>(false);
  createError$ = new BehaviorSubject<string | null>(null);

  form: CreateUserForm = {
    kind: 'PARENT',
    fullName: '',
    phone: '',
    email: '',
    password: '',
  };

  // ---- refresh trigger

  // Data stream
  private usersState$ = this.refresh$.pipe(
    switchMap(() =>
      this.admin.listUsers().pipe(
        map((users) => ({ loading: false, error: null as string | null, users })),
        startWith({ loading: true, error: null as string | null, users: [] as AdminUserRow[] }),
        catchError((e) =>
          of({
            loading: false,
            error: e?.error?.message || 'Impossible de charger la liste des utilisateurs.',
            users: [] as AdminUserRow[],
          }),
        ),
      ),
    ),
    shareReplay(1),
  );

  vm$ = combineLatest([this.usersState$, this.search$, this.roleFilter$]).pipe(
    map(([state, search, roleFilter]) => {
      const filtered = (state.users ?? []).filter((u) => {
        const roleOk = roleFilter === 'ALL' || u.role === roleFilter;
        const text = `${u.fullName ?? ''} ${u.email ?? ''}`.toLowerCase();
        return roleOk && text.includes((search ?? '').toLowerCase());
      });

      const vm: Vm = {
        loading: state.loading,
        error: state.error,
        users: state.users,
        filtered,
        search,
        roleFilter,
      };
      return vm;
    }),
    shareReplay(1),
  );


  // ================= actions =================

  refresh() {
    this.refresh$.next();
  }



submitCreate() {
    this.createError$.next(null);

    if (!this.form.fullName?.trim()) {
      this.createError$.next('Nom complet obligatoire.');
      return;
    }
    if (!this.form.email?.trim()) {
      this.createError$.next('Email obligatoire.');
      return;
    }
    if (!this.form.password?.trim()) {
      this.createError$.next('Mot de passe obligatoire.');
      return;
    }

    this.creating$.next(true);

    this.admin.createUserByKind(this.form).subscribe({
      next: () => {
        this.creating$.next(false);
        this.createOpen$.next(false);
        this.refresh(); // ✅ refresh automatique
      },
      error: (e) => {
        this.creating$.next(false);
        this.createError$.next(e?.error?.message || 'Erreur création utilisateur.');
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
  return ['/admin/user', u.id];
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
    // ====== UI actions
  setSearch(v: string) {
    this.search$.next(v);
  }

  setRoleFilter(v: Role | 'ALL') {
    this.roleFilter$.next(v);
  }

    openCreate(kind: CreateKind = 'PARENT') {
    this.createError$.next(null);
    this.form = { kind, fullName: '', phone: '', email: '', password: '' };
    this.createOpen$.next(true);
  }

  closeCreate() {
    if (this.creating$.value) return;
    this.createOpen$.next(false);
  }

    trackById = (_: number, x: { id?: number }) => x?.id ?? _;
}
