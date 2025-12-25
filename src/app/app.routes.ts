import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'landing' },
    {
        path: 'auth',
        loadChildren: () =>
            import('./auth/auth-module').then((m) => m.AuthModule),
    },
    
    {
        path: 'staff',
        loadChildren: () =>
            import('./staff/staff-module').then((m) => m.StaffModule),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ADMIN', 'BENEVOL'] },
    },
    {
        path: 'teacher',
        loadChildren: () =>
            import('./teacher/teacher-module').then((m) => m.TeacherModule),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['TEACHER'] },
    },

    {
        path: 'parent',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['PARENT'] },
        loadChildren: () =>
            import('./parent/parent-module').then((m) => m.ParentModule),
    },
    {
        path: 'admin',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ADMIN', 'BENEVOL'] },
        loadChildren: () =>
            import('./admin/admin-module').then((m) => m.AdminModule),
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'auth/login',
    },
      // PUBLIC
  {
    path: 'enrollment',
    loadComponent: () =>
      import('./public-enrollment/public-enrollment')
        .then(m => m.PublicEnrollment),
  },
  {
    path: 'enrollment/success',
    loadComponent: () =>
      import('./enrollment-success/enrollment-success')
        .then(m => m.EnrollmentSuccess),
  },

  /* optionnel plus tard
  {^/api/?(.*)$ /$1 break;
    path: 'enrollment/success',
    loadComponent: () =>
      import('./public/enrollment/enrollment-success.component')
        .then(m => m.EnrollmentSuccessComponent),
  },*/

    { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }

