import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadioDTO } from '../models/estadio.model';

@Injectable({ providedIn: 'root' })
export class EstadioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:114/Mundial2026_V1/estadio';

  getAll(): Observable<EstadioDTO[]> {
    return this.http.get<EstadioDTO[]>(`${this.baseUrl}/getAll`);
  }

  save(dto: EstadioDTO, file?: File | null): Observable<EstadioDTO> {
    const formData = new FormData();
    formData.append('estadio', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    if (file) formData.append('imagen', file);
    return this.http.post<EstadioDTO>(`${this.baseUrl}/saveEstadio`, formData);
  }

  findById(id: number): Observable<EstadioDTO> {
    return this.http.get<EstadioDTO>(`${this.baseUrl}/findRecord/${id}`);
  }

  delete(id: number): Observable<EstadioDTO> {
    return this.http.delete<EstadioDTO>(`${this.baseUrl}/deleteEstadio/${id}`);
  }
}