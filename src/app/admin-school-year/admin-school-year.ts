import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, SchoolYear } from '../admin/admin.service';

@Component({
  selector: 'app-admin-school-year',
imports: [CommonModule, FormsModule],
  template: `
  <div class="p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Années scolaires</h1>
    </div>

    <div class="bg-white rounded shadow p-4 flex gap-2 items-end">
      <div class="flex-1">
        <label class="block text-sm text-gray-600">Label</label>
        <input class="w-full border rounded px-3 py-2" [(ngModel)]="newLabel" placeholder="2025-2026" />
      </div>
      <button class="px-4 py-2 rounded bg-indigo-600 text-white" (click)="create()">Créer</button>
    </div>

    <div class="bg-white rounded shadow">
      <table class="w-full text-sm">
        <thead class="text-left border-b">
          <tr>
            <th class="p-3">Label</th>
            <th class="p-3">Active</th>
            <th class="p-3 w-48">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let y of years" class="border-b">
            <td class="p-3">{{ y.label }}</td>
            <td class="p-3">
              <span class="px-2 py-1 rounded text-xs"
                [class.bg-green-100]="y.isActive"
                [class.text-green-800]="y.isActive"
                [class.bg-gray-100]="!y.isActive"
                [class.text-gray-700]="!y.isActive">
                {{ y.isActive ? 'ACTIVE' : 'INACTIVE' }}
              </span>
            </td>
            <td class="p-3">
              <button class="px-3 py-1 rounded border" [disabled]="y.isActive" (click)="activate(y)">
                Activer
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p *ngIf="!years.length" class="p-4 text-gray-600">Aucune année.</p>
    </div>
  </div>
  `,
  })
export class AdminSchoolYear implements OnInit  {

  years: SchoolYear[] = [];
  newLabel = '';

  constructor(private admin: AdminService) {}

  ngOnInit() { this.reload(); }

  reload() {
    this.admin.getSchoolYears().subscribe((ys: SchoolYear) => (this.years = [ys]));
  }

  create() {
    if (!this.newLabel.trim()) return;
    this.admin.createSchoolYear({ label: this.newLabel.trim() }).subscribe(() => {
      this.newLabel = '';
      this.reload();
    });
  }

  activate(y: SchoolYear) {
    this.admin.activateSchoolYear(y.id).subscribe(() => this.reload());
  }

}
