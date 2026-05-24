import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReporteService } from '../../services/reporte.service';
import { EstadisticaDTO } from '../../models/estadistica.model';

@Component({
  selector: 'app-reportes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly auth = inject(AuthService);

  readonly estadisticas = signal<EstadisticaDTO[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.reporteService.getEstadisticas().subscribe({
      next: d => { this.estadisticas.set(d); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar estadísticas'); this.loading.set(false); }
    });
  }

  descargar(obs$: ReturnType<typeof this.reporteService.descargarPdfPartidos>, nombre: string): void {
    obs$.subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombre;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.error.set('Error al descargar archivo')
    });
  }

  pdfPartidos(): void {
    this.descargar(this.reporteService.descargarPdfPartidos(), 'partidos.pdf');
  }

  excelPartidos(): void {
    this.descargar(this.reporteService.descargarExcelPartidos(), 'partidos.xlsx');
  }

  pdfEstadisticas(): void {
    this.descargar(this.reporteService.descargarPdfEstadisticas(), 'estadisticas.pdf');
  }

  excelEstadisticas(): void {
    this.descargar(this.reporteService.descargarExcelEstadisticas(), 'estadisticas.xlsx');
  }

  salir(): void { this.auth.logout(); }
}