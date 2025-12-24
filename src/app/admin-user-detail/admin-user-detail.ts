import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService, AdminUserRow, Role } from '../admin/admin.service';
import { catchError, map, of, shareReplay, startWith, switchMap } from 'rxjs';

export type AdminUser = AdminUserRow & {
  // optionnel si ton back renvoie le profil détaillé
  profile?: any;
  profileType?: 'PARENT' | 'TEACHER' | 'STAFF' | 'BENEVOL' | 'ADMIN' | null;
  profileId?: number | null;
  isActive?: boolean;
  createdAt?: string;
};

type Vm = {
  loading: boolean;
  error: string | null;
  user: AdminUser | null;
};

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-user-detail.html',
})
export class AdminUserDetail {
  private route = inject(ActivatedRoute);
  private admin = inject(AdminService);

  private userId$ = this.route.paramMap.pipe(
    map((p) => Number(p.get('id'))),
  );

  vm$ = this.userId$.pipe(
    switchMap((id) => {
      if (!id || Number.isNaN(id)) {
        return of<Vm>({ loading: false, error: 'ID utilisateur invalide.', user: null });
      }

      return this.admin.getUserDetail(id).pipe(
        map((user) => ({ loading: false, error: null, user } as Vm)),
        startWith({ loading: true, error: null, user: null } as Vm),
        catchError((e) =>
          of<Vm>({
            loading: false,
            error: e?.error?.message || 'Impossible de charger le détail utilisateur.',
            user: null,
          }),
        ),
      );
    }),
    shareReplay(1),
  );

  badgeClass(role: string) {
    return {
      'bg-indigo-50 text-indigo-700': role === 'ADMIN',
      'bg-gray-100 text-gray-800': role === 'STAFF',
      'bg-green-100 text-green-800': role === 'BENEVOL',
      'bg-emerald-50 text-emerald-700': role === 'TEACHER',
      'bg-blue-50 text-blue-700': role === 'PARENT',
    };
  }

  statusClass(active?: boolean) {
    return active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700';
  }
}
