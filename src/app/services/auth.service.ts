import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioResponseDTO } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly baseUrl = 'http://localhost:8114/Mundial2026_V1/usuario';

  readonly currentUser = signal<UsuarioResponseDTO | null>(this.loadUser());

  private loadUser(): UsuarioResponseDTO | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem('wc_user');
    return raw ? JSON.parse(raw) : null;
  }

  login(credentials: { username: string; password: string }): Observable<HttpResponse<UsuarioResponseDTO>> {
    return this.http.post<UsuarioResponseDTO>(
      `${this.baseUrl}/login`, credentials, { observe: 'response' }
    );
  }

  setUser(user: UsuarioResponseDTO): void {
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

  isLoggedIn(): boolean { return this.currentUser() !== null; }
  isAdmin(): boolean {
    const u = this.currentUser();
    return u !== null && u.idRol === 1;
  }
}