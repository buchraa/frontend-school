import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './current-user.model';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const allowed = (route.data['roles'] as Role[] | undefined) ?? [];

    // pas connecté → login
    if (!this.auth.isLoggedIn()) return this.router.parseUrl('/login');

    // user pas encore chargé → on tente de le charger (version simple : bloque et redirige)
    const u = this.auth.getCurrentUser();
    if (!u) return this.router.parseUrl('/landing');

    // rôle OK
    if (allowed.length === 0 || allowed.includes(u.role)) return true;

    // rôle KO → redirection intelligente
    return this.router.parseUrl(this.redirectByRole(u.role));
  }

  private redirectByRole(role: Role): string {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'BENEVOL':
        return '/staff/dashboard';
      case 'STAFF':
        return '/staff/dashboard';
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'PARENT':
      default:
        return '/parent/dashboard';
    }
  }
}
