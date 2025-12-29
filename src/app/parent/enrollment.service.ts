import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CreatePublicEnrollmentDto } from "./models";
import { map, Observable } from 'rxjs';
import { environment } from "../../environments/environment";

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

export interface ParentEnrollmentItem {
  id: number;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_TEST' | 'VALIDATED' | 'REJECTED';
  schoolYear?: { id: number; label: string };
  children: Array<{
    id: number;
    existingStudent?: { id: number; fullName: string; studentRef: string };
    tempFirstName?: string | null;
    tempLastName?: string | null;
    birthDate?: string | null;
    desiredLevel?: string | null;
    notes?: string | null;
  }>;
}

export type AdminEnrollmentChild = {
  id: number;
  desiredLevel?: string | null;

  tempFirstName?: string | null;
  tempLastName?: string | null;

  existingStudent?: { id: number; fullName: string; studentRef?: string };

  enrollmentRequest?: {
    id: number;
    parent?: { id: number; fullName: string; familyCode: string };
    status?: string;
  };

  targetClassGroup?: { id: number; name: string } | null;
};

export interface UpdateEnrollmentDto {
  existingChildren?: Array<{
    enrollmentChildId: number;
    desiredLevel?: string | null;
    notes?: string | null;
  }>;
  newChildren?: Array<{
    firstName: string;
    lastName: string;
    birthDate?: string | null;
    desiredLevel?: string | null;
    notes?: string | null;
  }>;
  submit?: boolean; // ✅ ton backend le gère déjà dans updateEnrollment()
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createPublicEnrollment(payload: CreatePublicEnrollmentDto) {
    return this.http.post(`${this.API_URL}/enrollments/public`, payload);
  }
/*    getCurrent(): Observable<any> {
    return this.http.get<EnrollmentCurrent>(`${this.API_URL}/enrollments/current`);
  }*/

  update(dto: any): Observable<EnrollmentCurrent> {
    return this.http.patch<EnrollmentCurrent>(`${this.API_URL}/enrollments/update`, dto);
  }

  /** POST /enrollment/start : crée un DRAFT si inexistant et renvoie l’objet */
  start(): Observable<ParentEnrollmentItem> {
    return this.http.post<ParentEnrollmentItem>(`${this.API_URL}/enrollments/start`, {});
  }

  /** GET /enrollment/current : récupère l’enrollment courant (année active) */
  getCurrent(): Observable<ParentEnrollmentItem | null> {
    return this.http.get<ParentEnrollmentItem | null>(`${this.API_URL}/enrollments/current`);
  }

  /**
   * PATCH /enrollment/current : met à jour le brouillon
   * => Utilise EXACTEMENT ton UpdateEnrollmentDto back
   */
  updateCurrent(payload: UpdateEnrollmentDto): Observable<ParentEnrollmentItem> {
    return this.http.patch<ParentEnrollmentItem>(`${this.API_URL}/enrollments/update`, payload);
  }

  /** Submit = PATCH /enrollment/current { submit:true } */
  submitCurrent(payload: UpdateEnrollmentDto): Observable<ParentEnrollmentItem> {
    return this.updateCurrent(payload);
  }

    // GET /enrollment/admin/children?q=...
  adminSearchChildren(q: string): Observable<AdminEnrollmentChild[]> {
    return this.http.get<AdminEnrollmentChild[]>(`${this.API_URL}/enrollments/admin/children`, {
      params: { q },
    });
  }


    // POST /enrollment/admin/children/:childId/assign { groupId }
  adminAssignChildToGroup(childId: number, groupId: number) {
  return this.http.post<{ ok: boolean; child: any }>(
    `${this.API_URL}/enrollments/children/${childId}/assign/${groupId}`,
    {}
  );
}
}
