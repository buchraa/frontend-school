import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BillingStatus {
  id: number;
  year: number;
  month: number;
  childrenCount: number;
  expectedAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  dueDate: string | null;
  parent: {
    id: number;
    fullName: string;
    familyCode: string;
  };
}

export interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  method: string;
  reference: string | null;
  parentId?: number;
}

export interface ImportBankLine {
  reference: string;
  amount: number;
  date: string; // "2025-02-10"
}

export interface ImportBankResult {
  line: ImportBankLine;
  status: 'IMPORTED' | 'SKIPPED';
  reason?: string;
  familyCode?: string;
  billingId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBillingStatus(year: number, month: number): Observable<BillingStatus[]> {
    return this.http.get<BillingStatus[]>(
      `${this.API_URL}/billing/status`,
      {
        params: {
          year: year.toString(),
          month: month.toString(),
        },
      },
    );
  }

  getOverdue(year: number, month: number): Observable<BillingStatus[]> {
    return this.http.get<BillingStatus[]>(
      `${this.API_URL}/billing/overdue`,
      {
        params: {
          year: year.toString(),
          month: month.toString(),
        },
      },
    );
  }

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.API_URL}/payments`);
  }

  importBank(lines: ImportBankLine[]): Observable<ImportBankResult[]> {
    return this.http.post<ImportBankResult[]>(
      `${this.API_URL}/payments/import-bank`,
      { lines },
    );
  }
}
