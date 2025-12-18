import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParentDashboard } from '../parent-dashboard/parent-dashboard';
import { ParentLayout } from '../parent-layout/parent-layout';
import { ParentEnrollment } from '../parent-enrollment/parent-enrollment';

const routes: Routes = [
  {
    path: '',
    component: ParentLayout,
    children: [
      { path: 'dashboard', component: ParentDashboard },
      { path: 'enrollment/wizard', component: ParentEnrollment },
      
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParentRoutingModule { }
