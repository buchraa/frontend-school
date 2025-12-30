import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '../auth/current-user.model';
import { PublicAuthLayout } from '../public-layout/public-layout';


@Component({
  selector: 'app-landing',
  imports: [CommonModule, RouterLink,PublicAuthLayout],
 templateUrl: './landing.html',
})
export class Landing {
constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    // Si pas connecté → page publique
  /*  if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/enrollment');
      return;
    }

    // Si connecté mais user pas chargé → load whoami
    this.auth.loadCurrentUser().subscribe((u) => {
      if (!u) {
        this.router.navigateByUrl('/login');
        return;
      }
      this.router.navigateByUrl(this.redirectByRole(u.role));
    });*/
  }

  private redirectByRole(role: Role): string {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'STAFF':
        return '/staff/dashboard';
      case 'BENEVOL':
        return '/staff/dashboard';
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'PARENT':
      default:
        return '/parent/dashboard';
    }
  }}
