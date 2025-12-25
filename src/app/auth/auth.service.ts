import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

interface LoginResponse {
  access_token: string;
}

export interface CurrentUser {
  userId: number;
  email: string;
  role: 'ADMIN' | 'BENEVOL' | 'PARENT' | 'TEACHER';
  parentId: number | null;
  teacherId: number | null;
  staffId?: number | null;
  exp?: number;
  iat?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly API_URL = '/api'; // adapte si besoin

  private currentUser: CurrentUser | null = null;
    private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Observable<CurrentUser> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this.saveToken(res.access_token);
          localStorage.setItem(this.TOKEN_KEY, res.access_token);
        }),
        map(() => this.getCurrentUser() as CurrentUser),
      );
  }
  /*
    login(payload: { email: string; password: string }) {
    return this.http.post<{ access_token: string }>(`${this.API}/auth/login`, payload).pipe(
      tap(res => localStorage.setItem(this.TOKEN_KEY, res.access_token)),
    );
  }
  */

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser = null;
    this.router.navigate(['/auth/login']);
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.decodeAndSetCurrentUser(token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const user = this.getCurrentUser();
    if (!user || !user.exp) {
      return false;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return user.exp > nowInSeconds;
  }

  getCurrentUser(): CurrentUser | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    const token = this.getToken();
    if (!token) return null;

    this.decodeAndSetCurrentUser(token);
    return this.currentUser;
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (token) {
      this.decodeAndSetCurrentUser(token);
    }
  }

  private decodeAndSetCurrentUser(token: string): void {
    try {
      const payloadPart = token.split('.')[1];
      const decoded = JSON.parse(atob(payloadPart));

      this.currentUser = {
        userId: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        parentId: decoded.parentId ?? null,
        teacherId: decoded.teacherId ?? null,
        staffId: decoded.staffId ?? null,
        exp: decoded.exp,
        iat: decoded.iat,
      };
    } catch (e) {
      console.error('Failed to decode JWT', e);
      this.currentUser = null;
    }
  }


  /** Appel API /auth/whoami et met en cache */
  loadCurrentUser(): Observable<CurrentUser | null> {
    if (!this.getToken()) {
      this.currentUserSubject.next(null);
      return of(null);
    }

    return this.http.get<CurrentUser>(`${this.API_URL}/auth/whoami`).pipe(
      tap((u) => this.currentUserSubject.next(u)),
      catchError(() => {
        // token invalide/expiré → on nettoie
        this.logout();
        return of(null);
      }),
    );
  }
}
