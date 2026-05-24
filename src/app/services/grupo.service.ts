import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GrupoDTO } from '../models/grupo.model';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:114/Mundial2026_V1/grupo';

  getAll(): Observable<GrupoDTO[]> {
    return this.http.get<GrupoDTO[]>(`${this.baseUrl}/getAll`);
  }

  save(dto: GrupoDTO): Observable<GrupoDTO> {
    return this.http.post<GrupoDTO>(`${this.baseUrl}/saveGrupo`, dto);
  }

  findById(id: string): Observable<GrupoDTO> {
    return this.http.get<GrupoDTO>(`${this.baseUrl}/findRecord/${id}`);
  }

  delete(id: string): Observable<GrupoDTO> {
    return this.http.delete<GrupoDTO>(`${this.baseUrl}/deleteGrupo/${id}`);
  }
}