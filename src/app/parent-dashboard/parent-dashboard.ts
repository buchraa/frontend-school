import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParentService, FamilyBilling, Parent } from '../parent/parent.service';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { EnrollmentService } from '../parent/enrollment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-parent-dashboard',
 imports: [CommonModule, FormsModule],
  template: `
<div class="flex flex-wrap gap-2">
  <button class="px-4 py-2 rounded bg-blue-600 text-white text-sm" (click)="startReEnrollment()" [disabled]="startingEnrollment">
    <span *ngIf="!startingEnrollment">Démarrer une réinscription</span>
    <span *ngIf="startingEnrollment">Démarrage...</span>
  </button>
</div>

  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">Espace Parent</h1>

    <!-- Mois / année -->
    <div class="flex gap-3 items-end">
      <div>
        <label class="text-xs text-gray-600">Année</label>
        <input class="border rounded px-3 py-2 text-sm" type="number" [(ngModel)]="year" />
      </div>
      <div>
        <label class="text-xs text-gray-600">Mois</label>
        <input class="border rounded px-3 py-2 text-sm" type="number" min="1" max="12" [(ngModel)]="month" />
      </div>
      <button class="px-3 py-2 rounded bg-gray-200 text-sm" (click)="refresh()">Rafraîchir</button>
    </div>

    <!-- Inscriptions -->
    <section class="bg-white rounded shadow p-4 space-y-2">
      <h2 class="font-semibold">Mes inscriptions</h2>
      <div *ngIf="loadingEnrollments" class="text-sm text-gray-500">Chargement...</div>
      <ul *ngIf="!loadingEnrollments">
        <li *ngFor="let e of enrollments" class="text-sm border-b py-2">
          <div class="font-medium">Demande #{{ e.id }} — {{ e.status }}</div>
          <div class="text-gray-600">{{ e.children?.length ?? 0 }} enfant(s)</div>
        </li>
        <li *ngIf="!enrollments || enrollments.length == 0" class="text-sm text-gray-500">Aucune demande.</li>
      </ul>
    </section>

    <!-- Facture du mois -->
    <section class="bg-white rounded shadow p-4 space-y-2">
      <h2 class="font-semibold">Facture {{ month }}/{{ year }}</h2>
      <div *ngIf="loadingBilling" class="text-sm text-gray-500">Chargement...</div>

      <div *ngIf="!loadingBilling && billing">
        <div class="text-sm">Montant dû : <strong>{{ billing.expectedAmount }} €</strong></div>
        <div class="text-sm">Payé : <strong>{{ billing.paidAmount }} €</strong></div>
        <div class="text-sm">Statut : <strong>{{ billing.status }}</strong></div>
      </div>

      <div *ngIf="!loadingBilling && !billing" class="text-sm text-gray-500">
        Pas de facturation pour ce mois.
      </div>
    </section>

    <!-- Paiements -->
    <section class="bg-white rounded shadow p-4 space-y-2">
      <h2 class="font-semibold">Mes paiements</h2>
      <div *ngIf="loadingPayments" class="text-sm text-gray-500">Chargement...</div>

      <table *ngIf="!loadingPayments && payments.length" class="min-w-full text-sm">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-4 py-2 text-left">Date</th>
            <th class="px-4 py-2 text-left">Montant</th>
            <th class="px-4 py-2 text-left">Référence</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of payments" class="border-b">
            <td class="px-4 py-2">{{ p.paymentDate | date:'shortDate' }}</td>
            <td class="px-4 py-2">{{ p.amount }} €</td>
            <td class="px-4 py-2 font-mono">{{ p.reference || '—' }}</td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!loadingPayments && !payments.length" class="text-sm text-gray-500">
        Aucun paiement.
      </div>
    </section>
  </div>
  `,})
export class ParentDashboard implements OnInit{
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;

  enrollments: any[] = [];
  billing: any = null;
  payments: any[] = [];

loadingEnrollments = true;
loadingBilling = true;
loadingPayments = true;
currentParent : any;
startingEnrollment = false;
constructor(private router: Router, private enrollment: EnrollmentService, private parent: ParentService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
        this.parent.getMe().subscribe({
      next: (data) => {
        this.cdr.detectChanges();
        this.currentParent = data;
         this.refresh();
        console.log('Informations parentales récupérées', this.currentParent.familyCode);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des informations parentales', err);
      },
    });
   
  }

  refresh() {

    this.loadingEnrollments = this.loadingBilling = this.loadingPayments = true;

    this.parent.getMyEnrollments().subscribe({
      next: (res) => { this.enrollments = Array.isArray(res) ? res : (res ?  [res] : []);
        this.loadingEnrollments = false; },
      error: () => (this.loadingEnrollments = false),
    });

    this.parent.getMyBilling(this.currentParent?.id,this.year, this.month).subscribe({
      next: (res) => { this.billing = res; this.loadingBilling = false; },
      error: () => { this.billing = null; this.loadingBilling = false; },
    });

    this.parent.getMyPayments().subscribe({
      next: (res) => { this.payments = res ?? []; this.loadingPayments = false; },
      error: () => (this.loadingPayments = false),
    });
  }
 
startReEnrollment() {
  this.startingEnrollment = true;

  this.enrollment.start().subscribe({
    next: () => {
      this.startingEnrollment = false;
      this.router.navigate(['/parent/enrollment/wizard']); // route du wizard
    },
    error: (err) => {
      this.startingEnrollment = false;
      console.error(err);
      alert("Impossible de démarrer la réinscription.");
    },
  });
}

}
