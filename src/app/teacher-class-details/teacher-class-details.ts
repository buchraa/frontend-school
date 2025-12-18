import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TeacherService } from '../teacher/teacher.service';

@Component({
  selector: 'app-teacher-class-details',
imports: [CommonModule, RouterModule],
  template: `
  <div class="p-6 space-y-4">
    <a routerLink="/teacher/dashboard" class="text-sm text-indigo-600">← Retour</a>

    <h1 class="text-2xl font-bold">{{ clazz?.code }} — {{ clazz?.label }}</h1>
    <div class="text-sm text-gray-600">Niveau : {{ clazz?.level }}</div>

    @if(loading) {<div  class="text-sm text-gray-500">Chargement...</div>

    <div class="bg-white rounded shadow overflow-hidden" *ngIf="!loading">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-4 py-3 text-left">Réf</th>
            <th class="px-4 py-3 text-left">Nom</th>
            <th class="px-4 py-3 text-left">Niveau</th>
          </tr>
        </thead>
        <tbody>
        @for (s of students; track $index) {  <tr  class="border-b hover:bg-gray-50">
            <td class="px-4 py-3 font-mono">{{ s.studentRef }}</td>
            <td class="px-4 py-3">{{ s.fullName }}</td>
            <td class="px-4 py-3">{{ s.level }}</td>
          </tr>
        @if (students.length === 0) {  <tr class="border-b">
            <td colspan="3" class="px-4 py-8 text-center text-gray-500">Aucun élève.</td>
          </tr>}}
        </tbody>
      </table>
    </div>}
  </div>
  `,
  })
export class TeacherClassDetails {
 loading = true;
  clazz: any = null;
  students: any[] = [];

  constructor(private route: ActivatedRoute, private teacher: TeacherService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.teacher.getClassDetail(id).subscribe({
      next: (res) => {
        this.clazz = res;
        this.students = res?.students ?? [];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }}
