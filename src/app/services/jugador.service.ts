import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JugadorDTO } from '../models/jugador.model';

@Injectable({ providedIn: 'root' })
export class JugadorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:114/Mundial2026_V1/jugador';

  getAll(): Observable<JugadorDTO[]> {
    return this.http.get<JugadorDTO[]>(`${this.baseUrl}/getAll`);
  }

  save(dto: JugadorDTO, file?: File | null): Observable<JugadorDTO> {
    const formData = new FormData();
    formData.append('jugador', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    if (file) formData.append('foto', file);
    return this.http.post<JugadorDTO>(`${this.baseUrl}/saveJugador`, formData);
  }

  findById(id: number): Observable<JugadorDTO> {
    return this.http.get<JugadorDTO>(`${this.baseUrl}/findRecord/${id}`);
  }

  delete(id: number): Observable<JugadorDTO> {
    return this.http.delete<JugadorDTO>(`${this.baseUrl}/deleteJugador/${id}`);
  }
}
