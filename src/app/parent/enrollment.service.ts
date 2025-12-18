import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CreatePublicEnrollmentDto } from "./models";
import { Observable } from 'rxjs';

export type EnrollmentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PENDING_TEST'
  | 'VALIDATED'
  | 'REJECTED';

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

export interface EnrollmentCurrent {
  id: number;
  status: EnrollmentStatus;
  parent: any;
  schoolYear: any;
  children: FormEnrollmentChild[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  createPublicEnrollment(payload: CreatePublicEnrollmentDto) {
    return this.http.post(`${this.API_URL}/enrollments/public`, payload);
  }
    getCurrent(): Observable<EnrollmentCurrent> {
    return this.http.get<EnrollmentCurrent>(`${this.API_URL}/enrollments/current`);
  }

  update(dto: any): Observable<EnrollmentCurrent> {
    return this.http.patch<EnrollmentCurrent>(`${this.API_URL}/enrollments/update`, dto);
  }
    start(): Observable<any> {
    return this.http.post(`${this.API_URL}/enrollments/start`, {});
  }

}
