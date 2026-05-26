import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParametroDTO } from '../models/parametro.model';

const BASE = 'http://localhost:8114/Mundial2026_V1';

@Injectable({ providedIn: 'root' })
export class ParametroService {
  constructor(private http: HttpClient) {  }
  getAll(): Observable<ParametroDTO[]> { return this.http.get<ParametroDTO[]>(`${BASE}/parametro/getAll`); }
  save(dto: ParametroDTO): Observable<ParametroDTO> { return this.http.post<ParametroDTO>(`${BASE}/parametro/saveParametro`, dto); }
  delete(id: number): Observable<ParametroDTO> { return this.http.delete<ParametroDTO>(`${BASE}/parametro/deleteParametro/${id}`); }
}