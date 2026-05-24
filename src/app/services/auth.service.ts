import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioRequest, UsuarioResponse } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly baseUrl = 'http://localhost:114/Mundial2026_V1/usuario';

  readonly currentUser = signal<UsuarioResponse | null>(this.loadUser());

  private loadUser(): UsuarioResponse | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem('wc_user');
    return raw ? JSON.parse(raw) : null;
  }

  login(credentials: UsuarioRequest): Observable<HttpResponse<UsuarioResponse>> {
    return this.http.post<UsuarioResponse>(`${this.baseUrl}/login`, credentials, { observe: 'response' });
  }

  setUser(user: UsuarioResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('wc_user', JSON.stringify(user));
    }
    this.currentUser.set(user);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('wc_user');
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    const u = this.currentUser();
    return u !== null && u.idRol === 1;
  }
}
