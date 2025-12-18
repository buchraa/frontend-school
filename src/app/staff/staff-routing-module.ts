import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffDashboard } from '../staff-dashboard/staff-dashboard';
import { StaffLayout } from '../staff-layout/staff-layout';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';

const routes: Routes = [
  {
    path: '',
    component: StaffLayout,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['STAFF', 'ADMIN', 'BENEVOL'] },
    children: [
      { path: 'dashboard', component: StaffDashboard },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }
