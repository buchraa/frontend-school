import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type FamilyBillingStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface Parent {
  id: number;
  fullName: string;
  familyCode: string;
}

export interface FamilyBilling {
  id: number;
  year: number;
  month: number;
  childrenCount: number;
  expectedAmount: number;
  paidAmount: number;
  status: FamilyBillingStatus;
  dueDate: string | null;
  lastCheckedAt: string | null;
  parent?: Parent;
}

type EnrollmentRow = {
  id: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_TEST' | 'VALIDATED' | 'REJECTED';
  childrenCount?: number;
  schoolYear?: { label: string };
  createdAt?: string;
};

export type EnrollmentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PENDING_TEST'
  | 'VALIDATED'
  | 'REJECTED';
export interface EnrollmentCurrent {
  id: number;
  status: EnrollmentStatus;
  parent: any;
  schoolYear: any;
  children: FormEnrollmentChild[];
  createdAt?: string;
  updatedAt?: string;
}
export interface EnrollmentChild {
  id?: number;
  fullName?: string;
  tempLastName?: string;
  birthDate?: string;
  desiredLevel?: string;
  notes?: string;
  existingStudent?: any; // si tu l'as
}

export interface FormEnrollmentChild {
  id?: number;
 fullName?: string;
  tempFirstName?: string;
  tempLastName?: string;
  birthDate?: string;
  desiredLevel?: string;
  notes?: string;
  existingStudent?: any; // si tu l'as
}
@Injectable({
  providedIn: 'root',
})
export class ParentService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyFamilyBilling(): Observable<FamilyBilling[]> {
    return this.http.get<FamilyBilling[]>(`${this.API_URL}/billing/me/family-billing`);
  }
    getMe() {
    return this.http.get<Parent>(`${this.API_URL}/parents/me`);
  }
   getMyEnrollments() {
    return this.http.get<EnrollmentRow>(`${this.API_URL}/payments/enrollments`);
  }

  getMyBilling(parentId: number, year: number, month: number) {
    return this.http.get<any>(`${this.API_URL}/billing/family/${parentId}&year=${year}&month=${month}`);
  }

  getMyPayments() {
    return this.http.get<any[]>(`${this.API_URL}/payments/family`);
  }

      getCurrent(): Observable<any> {
      return this.http.get<EnrollmentCurrent>(`${this.API_URL}/enrollments/current`);
    }
  
}
