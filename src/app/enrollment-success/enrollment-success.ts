import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, CurrentUser } from '../auth/auth.service';
import { Parent, ParentService } from '../parent/parent.service';
@Component({
  selector: 'app-enrollment-success',
standalone: true,
imports: [CommonModule, RouterModule],
  template: `
<div class="max-w-xl mx-auto mt-20 bg-white shadow rounded p-6 text-center space-y-4">
    <h1 class="text-2xl font-bold text-green-700">Inscription envoyée 🎉</h1>

    <ng-container *ngIf="parent | async as parent">
      <p class="text-gray-700">
        Merci <strong>{{ parent?.fullName }}</strong>, votre demande a bien été enregistrée.
      </p>
      <p *ngIf="parent?.familyCode" class="text-sm text-gray-600">
        Code famille : <span class="font-mono">{{ parent?.familyCode }}</span>
      </p>
    </ng-container>

    <ng-template #simple>
      <p class="text-gray-700">Votre demande d’inscription a bien été enregistrée.</p>
    </ng-template>

    <p class="text-gray-600 text-sm">
      Les bénévoles vont étudier votre demande et vous contacter pour l’évaluation.
    </p>

    <div class="pt-4 flex justify-center gap-2">
      <a routerLink="/parent/dashboard" class="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-500">
        Accéder à mon espace
      </a>
      <a routerLink="/parent/enrollment/start" class="px-4 py-2 rounded bg-gray-200 text-gray-800 text-sm hover:bg-gray-300">
        Réinscription
      </a>
    </div>
  </div>  `,
})
export class EnrollmentSuccess {
  parent: Observable<Parent>; 

 constructor(public auth: AuthService, private parentService: ParentService)
 {
   this.parent = this.parentService.getMe();
 }
}
