import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadisticaDTO } from '../models/estadistica.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8114/Mundial2026_V1/reporte';

  getEstadisticas(): Observable<EstadisticaDTO[]> {
    return this.http.get<EstadisticaDTO[]>(`${this.baseUrl}/estadisticas/tabla`);
  }

  descargarPdfPartidos(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/partidos/pdf`, { responseType: 'blob' });
  }

  descargarExcelPartidos(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/partidos/excel`, { responseType: 'blob' });
  }

  descargarPdfEstadisticas(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/estadisticas/pdf`, { responseType: 'blob' });
  }

  descargarExcelEstadisticas(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/estadisticas/excel`, { responseType: 'blob' });
  }
}