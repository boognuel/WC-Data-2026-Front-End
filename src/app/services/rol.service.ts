import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolDTO } from '../models/rol.model';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:114/Mundial2026_V1/rol';

  getAll(): Observable<RolDTO[]> {
    return this.http.get<RolDTO[]>(`${this.baseUrl}/getAll`);
  }

  save(dto: RolDTO): Observable<RolDTO> {
    return this.http.post<RolDTO>(`${this.baseUrl}/saveRol`, dto);
  }

  findById(id: number): Observable<RolDTO> {
    return this.http.get<RolDTO>(`${this.baseUrl}/findRecord/${id}`);
  }

  delete(id: number): Observable<RolDTO> {
    return this.http.delete<RolDTO>(`${this.baseUrl}/deleteRol/${id}`);
  }
}