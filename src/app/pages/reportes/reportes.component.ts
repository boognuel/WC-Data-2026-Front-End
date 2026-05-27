import {
  ChangeDetectionStrategy, Component, inject, OnInit,
  signal, ViewChild, ElementRef, effect, PLATFORM_ID, OnDestroy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ReporteService } from '../../services/reporte.service';
import { PartidoService } from '../../services/partido.service';
import { EstadisticaDTO } from '../../models/estadistica.model';
import { PartidoDTO } from '../../models/partido.model';
import {
  Chart, BarController, BarElement, CategoryScale, LinearScale,
  Tooltip, Legend, DoughnutController, ArcElement, Title
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale,
  Tooltip, Legend, DoughnutController, ArcElement, Title);

@Component({
  selector: 'app-reportes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit, OnDestroy {
  private readonly reporteService = inject(ReporteService);
  private readonly partidoService = inject(PartidoService);
  private readonly auth = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('chartGoles') chartGolesRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartFases') chartFasesRef!: ElementRef<HTMLCanvasElement>;

  readonly estadisticas = signal<EstadisticaDTO[]>([]);
  readonly partidos = signal<PartidoDTO[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  private golesChart?: Chart;
  private fasesChart?: Chart;

  constructor() {
    effect(() => {
      const stats = this.estadisticas();
      const parts = this.partidos();
      if (!isPlatformBrowser(this.platformId)) return;
      // Defer to let Angular render canvas elements first
      setTimeout(() => {
        if (stats.length) this.renderGolesChart(stats);
        if (parts.length) this.renderFasesChart(parts);
      }, 0);
    });
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.reporteService.getEstadisticas().subscribe({
      next: d => { this.estadisticas.set(d); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar estadísticas'); this.loading.set(false); }
    });
    this.partidoService.getAll().subscribe({
      next: d => this.partidos.set(d),
      error: () => { }
    });
  }

  ngOnDestroy(): void {
    this.golesChart?.destroy();
    this.fasesChart?.destroy();
  }

  private renderGolesChart(stats: EstadisticaDTO[]): void {
    const canvas = this.chartGolesRef?.nativeElement;
    if (!canvas) return;
    this.golesChart?.destroy();

    // Only show teams that have played at least one match
    const active = stats.filter(s => s.partidosJugados > 0);
    const labels = active.map(s => s.nombreEquipo);
    const gf = active.map(s => s.golesAFavor);
    const gc = active.map(s => s.golesEnContra);

    this.golesChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Goles a favor',
            data: gf,
            backgroundColor: 'rgba(225,29,72,0.75)',
            borderColor: '#e11d48',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Goles en contra',
            data: gc,
            backgroundColor: 'rgba(37,99,235,0.6)',
            borderColor: '#2563eb',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#1a1a1a' } },
          title: { display: false }
        },
        scales: {
          x: { ticks: { color: '#6b7280', maxRotation: 45 }, grid: { color: '#e5e5e5' } },
          y: { ticks: { color: '#6b7280' }, grid: { color: '#e5e5e5' }, beginAtZero: true }
        }
      }
    });
  }

  private renderFasesChart(partidos: PartidoDTO[]): void {
    const canvas = this.chartFasesRef?.nativeElement;
    if (!canvas) return;
    this.fasesChart?.destroy();

    // Count matches per phase
    const counts: Record<string, number> = {};
    for (const p of partidos) {
      const fase = p.fase ?? 'Sin fase';
      counts[fase] = (counts[fase] ?? 0) + 1;
    }
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    const palette = [
      '#e11d48', '#2563eb', '#16a34a', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899', '#84cc16',
      '#f97316', '#0ea5e9', '#10b981', '#6366f1'
    ];

    this.fasesChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: palette.slice(0, labels.length),
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: '#1a1a1a', padding: 12, font: { size: 11 } } }
        }
      }
    });
  }

  private descargar(obs$: ReturnType<typeof this.reporteService.descargarPdfPartidos>, nombre: string): void {
    obs$.subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = nombre; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.error.set('Error al descargar archivo')
    });
  }

  pdfPartidos(): void { this.descargar(this.reporteService.descargarPdfPartidos(), 'partidos.pdf'); }
  excelPartidos(): void { this.descargar(this.reporteService.descargarExcelPartidos(), 'partidos.xlsx'); }
  pdfEstadisticas(): void { this.descargar(this.reporteService.descargarPdfEstadisticas(), 'estadisticas.pdf'); }
  excelEstadisticas(): void { this.descargar(this.reporteService.descargarExcelEstadisticas(), 'estadisticas.xlsx'); }
  salir(): void { this.auth.logout(); }
}