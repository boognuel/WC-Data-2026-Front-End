import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PartidoDTO } from '../models/partido.model';

@Injectable({ providedIn: 'root' })
export class PartidoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:114/Mundial2026_V1/partido';

  getAll(): Observable<PartidoDTO[]> {
    return this.http.get<PartidoDTO[]>(`${this.baseUrl}/getAll`);
  }

  save(dto: PartidoDTO): Observable<PartidoDTO> {
    return this.http.post<PartidoDTO>(`${this.baseUrl}/savePartido`, dto);
  }

  findById(id: number): Observable<PartidoDTO> {
    return this.http.get<PartidoDTO>(`${this.baseUrl}/findRecord/${id}`);
  }

  delete(id: number): Observable<PartidoDTO> {
    return this.http.delete<PartidoDTO>(`${this.baseUrl}/deletePartido/${id}`);
  }
}