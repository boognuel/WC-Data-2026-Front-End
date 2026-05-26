import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolDTO } from '../models/rol.model';

const BASE = 'http://localhost:8114/Mundial2026_V1';

@Injectable({ providedIn: 'root' })
export class RolService {
  constructor(private http: HttpClient) {  }
  getAll(): Observable<RolDTO[]> { return this.http.get<RolDTO[]>(`${BASE}/rol/getAll`); }
  save(dto: RolDTO): Observable<RolDTO> { return this.http.post<RolDTO>(`${BASE}/rol/saveRol`, dto); }
  delete(id: number): Observable<RolDTO> { return this.http.delete<RolDTO>(`${BASE}/rol/deleteRol/${id}`); }
}