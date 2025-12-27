import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type TeacherClassLite = {
  id: number;
  code: string;
  label: string;
  level: string;
  studentsCount?: number;
};

export type StudentLite = {
  id: number;
  studentRef: string;
  fullName: string;
  level?: string;
};

export interface AdminUserRow {
  id: number;
  email: string;
  fullName: string ;
  profileId: number;
}

@Injectable({ providedIn: 'root' })
export class TeacherService {
  constructor(private http: HttpClient) {}
  private readonly API_URL = environment.apiUrl;

  getDashboard() {
    return this.http.get<any>(`${this.API_URL}/teachers/dashboard`);
  }

  getClassDetail(classId: number) {
    return this.http.get<any>(`${this.API_URL}/teachers/classes/${classId}`);
  }

  getMyClasses() {
    return this.http.get<{TeacherId: number; classes:TeacherClassLite[]}>(`${this.API_URL}/teachers/dashboard`)
     .pipe(map(res => res.classes));;
  }

  getClassStudents(classId: number) {
    return this.http.get<{classId: number; students:StudentLite[]}>(
      `${this.API_URL}/teachers/classes/${classId}`
    )
    .pipe(map(res => res.students));
    ;
  }

        getProfil(): Observable<AdminUserRow> {
      return this.http.get<AdminUserRow>(`${this.API_URL}/auth/whoami`);
    }
}
