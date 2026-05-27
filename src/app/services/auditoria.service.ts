import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditoriaDTO } from '../models/auditoria.model';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8114/Mundial2026_V1/auditoria';

  getAll(): Observable<AuditoriaDTO[]> {
    return this.http.get<AuditoriaDTO[]>(`${this.baseUrl}/getAll`);
  }
}
