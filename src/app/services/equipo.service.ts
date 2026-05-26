import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EquipoDTO } from '../models/equipo.model';

@Injectable({ providedIn: 'root' })
export class EquipoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8114/Mundial2026_V1/equipo';

  getAll(): Observable<EquipoDTO[]> {
    return this.http.get<EquipoDTO[]>(`${this.baseUrl}/getAll`);
  }

  save(dto: EquipoDTO, file?: File | null): Observable<EquipoDTO> {
    const formData = new FormData();
    formData.append('equipo', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    if (file) formData.append('bandera', file);
    return this.http.post<EquipoDTO>(`${this.baseUrl}/saveEquipo`, formData);
  }

  findById(id: number): Observable<EquipoDTO> {
    return this.http.get<EquipoDTO>(`${this.baseUrl}/findRecord/${id}`);
  }

  delete(id: number): Observable<EquipoDTO> {
    return this.http.delete<EquipoDTO>(`${this.baseUrl}/deleteEquipo/${id}`);
  }
}
