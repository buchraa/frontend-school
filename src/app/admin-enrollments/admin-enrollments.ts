import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnrollmentAdminService } from './enrollment-admin.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule,  RouterModule],
  templateUrl: './admin-enrollments.html',
})
export class AdminEnrollments implements OnInit {
  requests: any[] = [];
  loading = true;
  error: string | null = null;

  statusFilter = 'SUBMITTED'; // on commence par les nouvelles demandes
  search = '';

  savingId: number | null = null;

  constructor(private service: EnrollmentAdminService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;
    this.service.getAllEnrollments().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Erreur lors du chargement des demandes.';
      },
    });
  }

  get filteredRequests() {
    const term = this.search.toLowerCase();
    return this.requests.filter((r) => {
      if (!term) return true;
      const parentName = r.parent?.fullName?.toLowerCase() || '';
      const familyCode = r.parent?.familyCode?.toLowerCase() || '';
      return parentName.includes(term) || familyCode.includes(term);
    });
  }

  setStatus(req: any, status: string) {
    this.savingId = req.id;
    this.service.updateStatus(req.id, status).subscribe({
      next: (updated) => {
        req.status = updated.status;
        this.savingId = null;
      },
      error: () => {
        this.savingId = null;
        alert("Erreur lors de la mise à jour du status.");
      },
    });
  }
}
