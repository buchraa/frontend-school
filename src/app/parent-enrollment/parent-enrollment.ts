import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EnrollmentService, EnrollmentCurrent, EnrollmentChild } from '../parent/enrollment.service';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-parent-enrollment',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-2">Inscription / Réinscription</h1>
    @if (e){<p class="text-gray-600 mb-6" >
      Statut : <span class="font-mono">{{ e.status }}</span>
    </p>}
    @if (loading){<div class="text-gray-500">Chargement...</div>}

   @if (!loading){ <div class="space-y-4">
      <div class="bg-white rounded shadow p-4">
        <h2 class="font-semibold mb-3">Enfants</h2>

       @if (!e.children.length ){  <div  class="text-gray-500">
          Aucun enfant dans le dossier.
        </div>}

        @for(c of (e.children); track $index){  
          <div class="space-y-3" >
          <div class="grid grid-cols-1 md:grid-cols-5 gap-2 items-end border rounded p-3">
            <div>
              <label class="text-xs text-gray-600">Nom complet</label>
              <input class="w-full border rounded px-2 py-1"
                     [(ngModel)]="c.tempFirstName" />
            </div>

            <div>
              <label class="text-xs text-gray-600">Nom</label>
              <input class="w-full border rounded px-2 py-1"
                     [(ngModel)]="c.tempLastName" />
            </div>

            <div>
              <label class="text-xs text-gray-600">Date de naissance</label>
              <input type="date" class="w-full border rounded px-2 py-1"
                     [(ngModel)]="c.birthDate" />
            </div>

            <div>
              <label class="text-xs text-gray-600">Niveau souhaité</label>
              <input class="w-full border rounded px-2 py-1"
                     [(ngModel)]="c.desiredLevel" />
            </div>

            <button class="bg-red-50 text-red-700 px-3 py-2 rounded"
                    (click)="removeChild($index)">
              Supprimer
            </button>
          </div>
        </div>}

        <button class="mt-4 bg-gray-100 px-4 py-2 rounded"
                (click)="addChild()">
          + Ajouter un enfant
        </button>
      </div>

      <div class="flex justify-end gap-2">
        <button class="px-4 py-2 rounded bg-gray-200"
                routerLink="/parent/dashboard">
          Retour
        </button>

        <button class="px-4 py-2 rounded bg-indigo-600 text-white"
                [disabled]="saving"
                (click)="saveDraft()">
          {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
        </button>

        <button class="px-4 py-2 rounded bg-green-600 text-white"
                [disabled]="saving"
                (click)="submit()">
          {{ saving ? 'Envoi...' : 'Soumettre' }}
        </button>
      </div>
    </div>}
  </div>
  `,
  })
export class ParentEnrollment implements OnInit {
  loading = true;
  saving = false;
  enrollment: EnrollmentCurrent | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private api: EnrollmentService,
    private router: Router,
  ) {}



  ngOnInit() {
    this.api.getCurrent().subscribe({
      next: (e) => { 
        this.enrollment = e; 
        this.loading = false; },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert("Impossible de charger le dossier en cours.");
        this.router.navigate(['/parent/dashboard']);
      },
    });
  }

  addChild() {
    if (!this.enrollment) return;
    this.enrollment.children = this.enrollment.children || [];

    this.enrollment.children.push({
      tempFirstName: '',
      tempLastName: '',
      birthDate: '',
      desiredLevel: '',
      notes: '',
    });

  }

  removeChild(i: number) {
    if (!this.enrollment) return;
    this.enrollment.children.splice(i, 1);
  }

  saveDraft() {
    if (!this.enrollment) return;
    this.saving = true;

    const dto = {
      // adapte à ton UpdateEnrollmentDto
      status: 'DRAFT',
      existingChildren: this.enrollment.children
    .filter(c => c.existingStudent)
    .map(c => ({
      studentId: c.existingStudent.id,
      desiredLevel: c.desiredLevel,
      notes: c.notes,
    })),

  newChildren: this.enrollment.children
    .filter(c => !c.existingStudent)
    .map(c => ({
      firstName: c.tempFirstName,
      lastName: c.tempLastName,
      birthDate: c.birthDate,
      desiredLevel: c.desiredLevel,
    })),
    };

    this.api.update(dto).subscribe({
      next: (e) => { this.enrollment = e; this.saving = false; },
      error: (err) => { console.error(err); this.saving = false; alert('Erreur sauvegarde'); },
    });
  }

  submit() {
    if (!this.enrollment) return;
    this.saving = true;

    const dto = {
      // adapte à ton UpdateEnrollmentDto
      status: 'DRAFT',
      existingChildren: this.enrollment.children
    .filter(c => c.existingStudent)
    .map(c => ({
      id: c.id,
      studentId: c.existingStudent.id,
      desiredLevel: c.desiredLevel,
      notes: c.notes,
    })),

  newChildren: this.enrollment.children
    .filter(c => !c.existingStudent)
    .map(c => ({
      firstName: c.tempFirstName,
      lastName: c.tempLastName,
      birthDate: c.birthDate,
      desiredLevel: c.desiredLevel,
    })),
    };

    this.api.update(dto).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/enrollment/success']);
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        alert("Erreur lors de l'envoi.");
      },
    });
  }

  get e(): EnrollmentCurrent  {
    return this.enrollment!;
   } 
}
