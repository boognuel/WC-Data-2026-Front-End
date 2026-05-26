import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioResponseDTO, UsuarioRequestDTO } from '../models/usuario.model';

const BASE = 'http://localhost:8114/Mundial2026_V1';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private http: HttpClient) {  }
  getAll(): Observable<UsuarioResponseDTO[]> { return this.http.get<UsuarioResponseDTO[]>(`${BASE}/usuario/getAll`); }
  save(dto: UsuarioRequestDTO): Observable<UsuarioResponseDTO> { return this.http.post<UsuarioResponseDTO>(`${BASE}/usuario/saveUsuario`, dto); }
  registro(dto: UsuarioRequestDTO): Observable<UsuarioResponseDTO> { return this.http.post<UsuarioResponseDTO>(`${BASE}/usuario/registro`, dto); }
  cambiarContrasena(dto: { username: string; password: string }): Observable<UsuarioResponseDTO> { return this.http.post<UsuarioResponseDTO>(`${BASE}/usuario/cambiarContrasena`, dto); }
  desbloquear(id: number): Observable<UsuarioResponseDTO> { return this.http.post<UsuarioResponseDTO>(`${BASE}/usuario/desbloquear/${id}`, {}); }
  delete(id: number): Observable<any> { return this.http.delete(`${BASE}/usuario/deleteUsuario/${id}`); }
}