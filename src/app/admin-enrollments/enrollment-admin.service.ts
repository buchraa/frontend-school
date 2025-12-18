import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EnrollmentAdminService {
  private API = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  list(status?: string) {
    let params = new HttpParams();
    if (status && status !== 'ALL') params = params.set('status', status);
    return this.http.get<any[]>(`${this.API}/enrollments/requests`, { params });
  }

  getAllEnrollments () {
    return this.http.get<any[]>(`${this.API}/admin/users/all-enrollments`);
  }

  updateStatus(id: number, status: string) {
    return this.http.patch<any>(`${this.API}/enrollments/${id}/status`, { status });
  }

  getOne(id: number) {
  return this.http.get<any>(`${this.API}/enrollments/request/${id}`);
}
getClassGroups() {
  return this.http.get<any[]>(`http://localhost:3000/classes`);
}

}
