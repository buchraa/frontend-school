import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';

const routes: Routes = 
[
{
  path: '',
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['TEACHER'] },
  children: [
    { path: 'dashboard', loadComponent: () => import('../teacher-dasboard/teacher-dasboard').then(m => m.TeacherDasboard) },
    { path: 'classes/:id', loadComponent: () => import('../teacher-class-details/teacher-class-details').then(m => m.TeacherClassDetails) },
  ],
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeacherRoutingModule { }
