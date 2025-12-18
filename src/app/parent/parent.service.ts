import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class ParentService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getMyFamilyBilling(): Observable<FamilyBilling[]> {
    return this.http.get<FamilyBilling[]>(`${this.API_URL}/billing/me/family-billing`);
  }
    getMe() {
    return this.http.get<Parent>(`${this.API_URL}/parents/me`);
  }
   getMyEnrollments() {
    return this.http.get<any[]>(`${this.API_URL}/payments/enrollments`);
  }

  getMyBilling(parentId: number, year: number, month: number) {
    return this.http.get<any>(`${this.API_URL}/billing/family/${parentId}&year=${year}&month=${month}`);
  }

  getMyPayments() {
    return this.http.get<any[]>(`${this.API_URL}/payments/family`);
  }
}
