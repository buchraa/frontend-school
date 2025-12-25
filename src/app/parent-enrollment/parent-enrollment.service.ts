import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ParentEnrollmentService {
  private API = '/api/enrollment';

  constructor(private http: HttpClient) {}

  /** Crée ou récupère le brouillon d'inscription pour l'année active */
  startOrLoad() {
    // On appelle start : si déjà existant, le backend renvoie la demande
    return this.http.post<any>(`${this.API}/start`, {});
  }

  /** Récupère la demande actuelle (si besoin ailleurs) */
  getCurrent() {
    return this.http.get<any>(`${this.API}/current`);
  }

  /** Met à jour / soumet la demande */
  update(payload: any) {
    return this.http.patch<any>(`${this.API}/update`, payload);
  }
}
