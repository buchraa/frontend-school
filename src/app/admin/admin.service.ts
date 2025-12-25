// src/app/admin/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export type Role = 'ADMIN' | 'STAFF' | 'TEACHER' | 'PARENT' | 'BENEVOL';
export type ProfileType = 'PARENT' | 'TEACHER' | 'STAFF' | 'BENEVOL' | null;
export type CreateUserRole = 'PARENT' | 'TEACHER' | 'STAFF' | 'BENEVOL';
export type CreateKind = 'PARENT' | 'STAFF' | 'TEACHER' | 'BENEVOL';

export interface SchoolYear {
  id: number;
  label: string;
  isActive: boolean;
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

export interface ClassGroup {
  id: number;
  code: string;
  label?: string | null;
  level?: string | null;
  maxStudents?: number | null;
  teachers?: { id:number; fullName:string }[];
  students?: { id:number; fullName:string; studentRef?:string|null }[];
}

export interface TeacherLite {
  id: number;
  fullName: string;
  email?: string | null;
}

export interface StudentLite {
  id: number;
  fullName: string;
  studentRef?: string | null;
  classGroup?: { id:number; code:string } | null;
}


export interface CreateUserForm {
  kind: CreateKind;
  fullName: string;
  phone?: string;
  email: string;
  password: string;
}

export interface SubjectClass {
  id: number;
  name: string;
  code: string;
}
export interface AdminUserRow {
  id: number;
  email: string;
  role: Role;
  fullName: string | null;
  profileType: ProfileType;
  profileId: number | null;
}


export interface ParentDto {
  id: number;
  familyCode: string;
  fullName: string;
  phone: string | null;
  email: string | null;
}

export interface AdminUser {
  id: number;
  email: string;
  role: 'ADMIN' | 'BENEVOL' | 'PARENT' | 'TEACHER' | 'STAFF';
}

export type AdminUserDetail = {
  id: number;
  email: string;
  role: Role;
  fullName?: string | null;
  createdAt?: string;
  isActive?: boolean;

  // optionnel si ton back l’expose
  profileType?: ProfileType;
  profileId?: number | null;

  // “profile” détaillé, variable selon le rôle
  profile?: any;
};

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly API_URL = '/api';

  constructor(private http: HttpClient) {}

    createUserByKind(payload: CreateUserForm) {
    const path = this.getCreatePath(payload.kind);
    const body = {
      fullName: payload.fullName,
      phone: payload.phone || undefined,
      email: payload.email,
      password: payload.password,
    };
    return this.http.post(`${this.API_URL}${path}`, body);
  }

  private getCreatePath(kind: CreateKind) {
    switch (kind) {
      case 'PARENT':
        return '/admin/users/parent';
      case 'STAFF':
        return '/admin/users/gestionnaire'; 
      case 'BENEVOL':
        return '/admin/users/gestionnaire'; 
      case 'TEACHER':
        return '/admin/users/teacher';
    }
  }

  // SUBJECTS
  getSubjects(): Observable<SubjectClass[]> {
    return this.http.get<SubjectClass[]>(`${this.API_URL}/subjects`);
  }

  createSubject(payload: Partial<SubjectClass>): Observable<SubjectClass> {
    return this.http.post<SubjectClass>(`${this.API_URL}/subjects`, payload);
  }

  updateSubject(id: number, payload: Partial<SubjectClass>): Observable<SubjectClass> {
    return this.http.patch<SubjectClass>(`${this.API_URL}/subjects/${id}`, payload);
  }

  deleteSubject(id: number) {
    return this.http.delete(`${this.API_URL}/subjects/${id}`);
  }


  updateClassGroup(id: number, payload: Partial<ClassGroup>): Observable<ClassGroup> {
    return this.http.patch<ClassGroup>(`${this.API_URL}/classes/${id}`, payload);
  }

  deleteClassGroup(id: number) {
    return this.http.delete(`${this.API_URL}/classes/${id}`);
  }

  // USERS (squelette, on utilisera plus tard)
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.API_URL}/admin/users`);
  }

    getProfil(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.API_URL}/auth/whoami`);
  }



   // ✅ Create Parent (comme ton test Thunder Client)
  createParent(payload: { fullName: string; phone?: string }) {
    return this.http.post<ParentDto>(`${this.API_URL}/admin/users/parent`, payload);
  }

    // ✅ list users (all types)
  listUsers() {
    return this.http.get<AdminUserRow[]>(`${this.API_URL}/admin/users/list-users`);
  }

  // (optionnel) delete user si tu as l’endpoint
  deleteUser(userId: number) {
    return this.http.delete<{ ok: true }>(`${this.API_URL}/admin/users/${userId}`);
  }

    // 🔹 CREATE Parent / Teacher / Staff (même logique backend)
  createUser(payload: {
    role: CreateUserRole;
    fullName: string;
    phone?: string;
    email: string;
    password: string;
  }) {
    return this.http.post(`${this.API_URL}/admin/users`, payload);
    // backend: switch(dto.role) → create Parent/Teacher/Staff + User
  }

  // 🔹 EDIT user (email / role)
  updateUser(id: number, payload: { email?: string; role?: string }) {
    return this.http.patch(`${this.API_URL}/admin/users/${id}`, payload);
  }

  getKpis() {
  return this.http.get<{ pendingEnrollments:number; students:number; teachers:number; classGroups:number }>(
    `${this.API_URL}/admin/users/kpis`
  );
}

getRecentEnrollments() {
  return this.http.get<any[]>(`${this.API_URL}/admin/users/recent-enrollments`);
}

getAlerts() {
  return this.http.get<any[]>(`${this.API_URL}/admin/users/alerts`);
}

// ---------- School Years
  getSchoolYears() {
    return this.http.get<SchoolYear>(`${this.API_URL}/admin/users/school-year/active`);
  }

  createSchoolYear(dto: { label: string }) {
    return this.http.post<SchoolYear>(`${this.API_URL}/admin/users/school-year`, dto);
  }

  activateSchoolYear(id: number) {
    return this.http.patch(`${this.API_URL}/admin/school-year/${id}/activate`, {});
  }

  // ---------- Class Groups

    getClassGroups() {
    return this.http.get<ClassGroup[]>(`${this.API_URL}/classes`);
  }

 /* getClassGroups(params?: { schoolYearId?: number }) {
    const q = params?.schoolYearId ? `?schoolYearId=${params.schoolYearId}` : '';
    return this.http.get<ClassGroup[]>(`${this.API_URL}/admin/class-groups${q}`);
  }*/

  createClassGroup(dto: { code: string; label?: string; level?: string; maxStudents?: number; schoolYearId?: number }) {
    return this.http.post<ClassGroup>(`${this.API_URL}/classes`, dto);
  }

  getClassGroup(id: number) {
    return this.http.get<ClassGroup>(`${this.API_URL}/classes/${id}`);
  }

  // Teachers
  listTeachers() {
    return this.http.get<TeacherLite[]>(`${this.API_URL}/teachers/list-teachers`);
  }

  // ManyToMany teacher<->group : set teachers list
  setGroupTeachers(groupId: number, teacherIds: number[]) {
    return this.http.post(`${this.API_URL}/classes/${groupId}/teachers`, { teacherIds });
  }

  // Students
  searchStudents(q: string) {
    return this.http.get<StudentLite[]>(`${this.API_URL}/enrollments/admin/children?search=${encodeURIComponent(q)}`);
  }

  // Student ManyToOne: on affecte l'élève à ce groupe (liste d’ids)
  addStudentsToGroup(groupId: number, childIds: number[]) {
    return this.http.post(`${this.API_URL}/classes/${groupId}/assign-child`, { childIds });
  }

  removeStudentFromGroup(groupId: number, studentId: number) {
    return this.http.delete(`${this.API_URL}/classes/class-groups/${groupId}/students/${studentId}`);
  }

  getUserDetail(userId: number) {
  return this.http.get<AdminUserDetail>(`${this.API_URL}/admin/users/${userId}`);
}

/*listEnrollmentChildren() {
return this.http.get<AdminEnrollmentChild[]>(`${this.API_URL}/enrollments/children-to-assign`);

}*/

// admin.service.ts
listEnrollmentChildren(q: string) {
  return this.http.get<AdminEnrollmentChild[]>(
    `${this.API_URL}/admin/enrollment-children`,
    { params: { q } }
  );
}

assignEnrollmentChildToGroup(childId: number, groupId: number) {
  return this.http.post(
    `${this.API_URL}/admin/enrollment-children/${childId}/assign/${groupId}`,
    {}
  );
}
}
