import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';

type MenuItem = { label: string; to: any[]; roles?: string[] };

@Component({
  standalone: true,
  selector: 'app-staff-layout',
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './staff-layout.html',
})
export class StaffLayout {
  private auth = inject(AuthService);

  

  mobileOpen = signal(false);

  user = computed(() => this.auth.getCurrentUser()); // peut être null

  // menu staff + "admin pages" réutilisées
  menu: MenuItem[] = [
    { label: 'Dashboard Paiements', to: ['/staff/dashboard'] },
   // { label: 'Inscriptions', to: ['/staff/enrollments'] },
    //{ label: 'Utilisateurs', to: ['/admin/users'] },
    //{ label: 'Classes', to: ['/admin/classes-subjects'] },
  ];

  logout() {
    this.auth.logout();
  }

  toggleMobile() {
    this.mobileOpen.set(!this.mobileOpen());
  }
}
       