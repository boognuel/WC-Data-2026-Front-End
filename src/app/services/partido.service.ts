import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PartidoDTO } from '../models/partido.model';

const BASE = 'http://localhost:8114/Mundial2026_V1';

@Injectable({ providedIn: 'root' })
export class PartidoService {
  constructor(private http: HttpClient) {  }
  getAll(): Observable<PartidoDTO[]> { return this.http.get<PartidoDTO[]>(`${BASE}/partido/getAll`); }
  save(dto: PartidoDTO): Observable<PartidoDTO> { return this.http.post<PartidoDTO>(`${BASE}/partido/savePartido`, dto); }
  delete(id: number): Observable<PartidoDTO> { return this.http.delete<PartidoDTO>(`${BASE}/partido/deletePartido/${id}`); }
}