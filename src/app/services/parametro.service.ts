import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParametroDTO } from '../models/parametro.model';

@Injectable({ providedIn: 'root' })
export class ParametroService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:114/Mundial2026_V1/parametro';

  getAll(): Observable<ParametroDTO[]> {
    return this.http.get<ParametroDTO[]>(`${this.baseUrl}/getAll`);
  }

  save(dto: ParametroDTO): Observable<ParametroDTO> {
    return this.http.post<ParametroDTO>(`${this.baseUrl}/saveParametro`, dto);
  }

  findById(id: number): Observable<ParametroDTO> {
    return this.http.get<ParametroDTO>(`${this.baseUrl}/findRecord/${id}`);
  }

  delete(id: number): Observable<ParametroDTO> {
    return this.http.delete<ParametroDTO>(`${this.baseUrl}/deleteParametro/${id}`);
  }
}