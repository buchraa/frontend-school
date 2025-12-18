import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnrollmentAdminService } from '../admin-enrollments/enrollment-admin.service';


@Component({
  selector: 'app-admin-enrollment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-enrollment-detail.html',
})
export class AdminEnrollmentDetail implements OnInit {
  request: any;
  loading = true;
  error: string | null = null;
  saving = false;

  classGroups: any[] = [];
  statusOptions = ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_TEST', 'VALIDATED', 'REJECTED'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: EnrollmentAdminService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
    this.loadClassGroups();
  }

  load(id: number) {
    this.loading = true;
    this.service.getOne(id).subscribe({
      next: (data) => {
        this.request = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement de la demande.';
        this.loading = false;
      },
    });
  }

  loadClassGroups() {
    this.service.getClassGroups().subscribe({
      next: (groups) => (this.classGroups = groups),
      error: () => {}, // optionnel
    });
  }

  saveChildAssignments() {
    // tu peux créer un endpoint dédié si tu veux,
    // ou réutiliser updateStatus avec un DTO plus riche.
    // ici, on suppose un endpoint PATCH /enrollment/:id/admin-update
    this.saving = true;
    const payload = {
      children: this.request.children.map((c: any) => ({
        enrollmentChildId: c.id,
        desiredLevel: c.desiredLevel,
        targetClassGroupId: c.targetClassGroup?.id || null,
      })),
    };

    // à implémenter côté service & backend si besoin
    // this.service.adminUpdate(this.request.id, payload)...
    this.saving = false;
  }

  changeStatus(status: string) {
    this.saving = true;
    this.service.updateStatus(this.request.id, status).subscribe({
      next: (updated) => {
        this.request.status = updated.status;
        this.saving = false;
        if (status === 'VALIDATED') {
          alert('Demande validée, élèves créés et affectés aux classes.');
        }
      },
      error: () => {
        this.saving = false;
        alert('Erreur lors de la mise à jour du statut.');
      },
    });
  }

  back() {
    this.router.navigate(['/admin/enrollments']);
  }
}
