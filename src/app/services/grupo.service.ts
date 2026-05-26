import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GrupoDTO } from '../models/grupo.model';

const BASE = 'http://localhost:8114/Mundial2026_V1';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<GrupoDTO[]> { return this.http.get<GrupoDTO[]>(`${BASE}/grupo/getAll`); }
  save(dto: GrupoDTO): Observable<GrupoDTO> { return this.http.post<GrupoDTO>(`${BASE}/grupo/saveGrupo`, dto); }
  delete(id: string): Observable<GrupoDTO> { return this.http.delete<GrupoDTO>(`${BASE}/grupo/deleteGrupo/${id}`); }
}