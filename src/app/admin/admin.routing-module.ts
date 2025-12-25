// src/app/admin/admin.routes.ts
import { RouterModule, Routes } from '@angular/router';
import { AdminHome } from '../admin-home/admin-home';
import { AdminClassesSubjects } from '../admin-classes-subjects/admin-classes-subjects';
import { AdminUsers } from '../admin-users/admin-users';
import { NgModule } from '@angular/core';
import { AdminDashboard } from '../admin-dashboard/admin-dashboard';
import { AdminEnrollments } from '../admin-enrollments/admin-enrollments';
import { AdminClassGroupDetail } from '../admin-class-group-detail/admin-class-group-detail';
import { AdminEnrollmentDetail } from '../admin-enrollment-detail/admin-enrollment-detail';
import { AdminUserDetail } from '../admin-user-detail/admin-user-detail';
import { AdminSchoolYear } from '../admin-school-year/admin-school-year';

export const routes: Routes = [
    {
        path: '',
        component: AdminHome,
        children: [
            {
                path: '',
                component: AdminDashboard,
            },
                        {
                path: 'classes-subjects',
                component: AdminClassesSubjects,
            },

            {
                path: 'school-years',
                component: AdminSchoolYear,
            },
                        {
                path: 'classes-details/:id',
                component: AdminClassGroupDetail,
            },
            {
                path: 'users',
                component: AdminUsers,
            },
                        {
                path: 'user/:id',
                component: AdminUserDetail,
            },
            {
                path: 'enrollments',
                component: AdminEnrollments
            },
                        {
                path: 'enrollment/:id',
                component: AdminEnrollmentDetail
            }
        ]
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
