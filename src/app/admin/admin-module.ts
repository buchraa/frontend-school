import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin.routing-module';
import { FormsModule } from '@angular/forms';
import { AdminDashboard } from '../admin-dashboard/admin-dashboard';
import { AdminClassesSubjects } from '../admin-classes-subjects/admin-classes-subjects';
import { AdminUsers } from '../admin-users/admin-users';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    AdminDashboard,
    AdminClassesSubjects,
    AdminUsers,
  ]
})
export class AdminModule { }
