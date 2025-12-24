import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnrollmentService } from '../parent/enrollment.service';

@Component({
  standalone: true,
  selector: 'app-parent-enrollment-start',
  template: `
    <div class="p-4 text-sm text-gray-600">Initialisation de votre inscription…</div>
  `,
})
export class ParentEnrollment implements OnInit {
  private svc = inject(EnrollmentService);
  private router = inject(Router);

  ngOnInit(): void {
    // 1) on tente de récupérer current
    this.svc.getCurrent().subscribe({
      next: (cur) => {
        if (cur) {
          this.router.navigate(['/parent/enrollment/wizard']);
          return;
        }
        // 2) sinon on crée un DRAFT
        this.svc.start().subscribe({
          next: () => this.router.navigate(['/parent/enrollment/wizard']),
          error: (e) => console.error(e),
        });
      },
      error: (e) => {
        console.error(e);
        // fallback : start
        this.svc.start().subscribe({
          next: () => this.router.navigate(['/parent/enrollment/wizard']),
        });
      },
    });
  }
}
