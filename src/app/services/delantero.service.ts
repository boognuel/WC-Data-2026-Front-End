import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DelanteroDTO } from '../models/Delantero.model';

@Injectable({ providedIn: 'root' })
export class DelanteroService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8114/Mundial2026_V1/delantero';

  getAll(): Observable<DelanteroDTO[]> {
    return this.http.get<DelanteroDTO[]>(`${this.baseUrl}/getAll`);
  }

  save(dto: DelanteroDTO, file?: File | null): Observable<DelanteroDTO> {
    const formData = new FormData();
    formData.append('Delantero', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    if (file) formData.append('bandera', file);
    return this.http.post<DelanteroDTO>(`${this.baseUrl}/saveDelantero`, formData);
  }

  findById(id: number): Observable<DelanteroDTO> {
    return this.http.get<DelanteroDTO>(`${this.baseUrl}/findRecord/${id}`);
  }

  delete(id: number): Observable<DelanteroDTO> {
    return this.http.delete<DelanteroDTO>(`${this.baseUrl}/deleteDelantero/${id}`);
  }
}
