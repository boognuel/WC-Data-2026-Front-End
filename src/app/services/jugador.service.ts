import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JugadorDTO } from '../models/jugador.model';

@Injectable({ providedIn: 'root' })
export class JugadorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8114/Mundial2026_V1/jugador';

  getAll(): Observable<JugadorDTO[]> {
    return this.http.get<JugadorDTO[]>(`${this.baseUrl}/getAll`);
  }

  save(dto: JugadorDTO): Observable<JugadorDTO> {
    return this.http.post<JugadorDTO>(`${this.baseUrl}/saveJugador`, dto);
  }

  findById(id: number): Observable<JugadorDTO> {
    return this.http.get<JugadorDTO>(`${this.baseUrl}/findRecord/${id}`);
  }

  delete(id: number): Observable<JugadorDTO> {
    return this.http.delete<JugadorDTO>(`${this.baseUrl}/deleteJugador/${id}`);
  }
}