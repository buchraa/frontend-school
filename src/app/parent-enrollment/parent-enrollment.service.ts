import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ParentEnrollmentService {
  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Crée ou récupère le brouillon d'inscription pour l'année active */
  startOrLoad() {
    // On appelle start : si déjà existant, le backend renvoie la demande
    return this.http.post<any>(`${this.API}/enrollments/start`, {});
  }

  /** Récupère la demande actuelle (si besoin ailleurs) */
  getCurrent() {
    return this.http.get<any>(`${this.API}/enrollments/current`);
  }

  /** Met à jour / soumet la demande */
  update(payload: any) {
    return this.http.patch<any>(`${this.API}/enrollments/update`, payload);
  }
}
