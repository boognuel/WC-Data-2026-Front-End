import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PartidoService } from '../../services/partido.service';
import { EquipoService } from '../../services/equipo.service';
import { PartidoDTO } from '../../models/partido.model';
import { EquipoDTO } from '../../models/equipo.model';

interface DiaInfo {
  iso: string;
  date: Date;
  count: number;
}

@Component({
  selector: 'app-partidos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './partidos.component.html',
  styleUrl: './partidos.component.css'
})
export class PartidosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly partidoService = inject(PartidoService);
  private readonly equipoService = inject(EquipoService);

  readonly partidos = signal<PartidoDTO[]>([]);
  readonly equipos = signal<EquipoDTO[]>([]);
  readonly editMode = signal(false);
  readonly showForm = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loading = signal(false);
  readonly diaSeleccionado = signal<string | null>(null);
  readonly diaOffset = signal(0);
  readonly diasPorPagina = 7;

  readonly dias = computed<DiaInfo[]>(() => {
    const mapa = new Map<string, DiaInfo>();
    for (const p of this.partidos()) {
      if (!p.fechaHora) continue;
      const d = new Date(p.fechaHora);
      const iso = d.toISOString().slice(0, 10);
      if (!mapa.has(iso)) mapa.set(iso, { iso, date: new Date(iso + 'T00:00:00'), count: 0 });
      mapa.get(iso)!.count++;
    }
    return Array.from(mapa.values()).sort((a, b) => a.iso.localeCompare(b.iso));
  });

  readonly diasVisibles = computed(() => {
    const todos = this.dias();
    const start = this.diaOffset();
    return todos.slice(start, start + this.diasPorPagina);
  });

  readonly partidosDia = computed(() => {
    const dia = this.diaSeleccionado();
    if (!dia) return [];
    return this.partidos()
      .filter(p => p.fechaHora && new Date(p.fechaHora).toISOString().slice(0, 10) === dia)
      .sort((a, b) => new Date(a.fechaHora!).getTime() - new Date(b.fechaHora!).getTime());
  });

  readonly form = this.fb.group({
    idPartido: [null as number | null],
    idEquipoLocal: [null as number | null, Validators.required],
    idEquipoVisitante: [null as number | null, Validators.required],
    fase: ['', Validators.required],
    golesLocal: [null as number | null],
    golesVisitante: [null as number | null],
    fechaHora: [''],
    estado: ['A']
  });

  ngOnInit(): void {
    this.cargar();
    this.cargarEquipos();
  }

  cargar(): void {
    this.partidoService.getAll().subscribe({
      next: d => {
        this.partidos.set(d);
        if (!this.diaSeleccionado() && this.dias().length) {
          this.diaSeleccionado.set(this.dias()[0].iso);
        }
      },
      error: () => this.error.set('Error al cargar partidos')
    });
  }

  cargarEquipos(): void {
    this.equipoService.getAll().subscribe({
      next: d => this.equipos.set(
        [...d].sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es'))
      )
    });
  }

  seleccionarDia(iso: string): void { this.diaSeleccionado.set(iso); }

  prevDias(): void {
    this.diaOffset.update(v => Math.max(0, v - this.diasPorPagina));
  }
  nextDias(): void {
    const total = this.dias().length;
    this.diaOffset.update(v => Math.min(total - this.diasPorPagina, v + this.diasPorPagina));
  }

  equipo(id: number | null | undefined): EquipoDTO | undefined {
    if (id == null) return undefined;
    return this.equipos().find(e => e.idEquipo === id);
  }

  estadoPartido(p: PartidoDTO): 'FIN' | 'LIVE' | 'PEND' {
    if (p.golesLocal != null && p.golesVisitante != null) return 'FIN';
    if (!p.fechaHora) return 'PEND';
    const now = Date.now();
    const start = new Date(p.fechaHora).getTime();
    if (now < start) return 'PEND';
    return 'LIVE';
  }

  guardar(): void {
    if (this.form.invalid) return;
    const raw = this.form.value;
    if (raw.idEquipoLocal === raw.idEquipoVisitante) {
      this.error.set('Local y visitante no pueden ser el mismo equipo');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    const dto: PartidoDTO = {
      ...raw,
      idEquipoLocal: Number(raw.idEquipoLocal),
      idEquipoVisitante: Number(raw.idEquipoVisitante),
      golesLocal: raw.golesLocal !== null && raw.golesLocal !== undefined ? Number(raw.golesLocal) : null,
      golesVisitante: raw.golesVisitante !== null && raw.golesVisitante !== undefined ? Number(raw.golesVisitante) : null,
      fechaHora: raw.fechaHora ? new Date(raw.fechaHora) : null,
    } as PartidoDTO;
    this.partidoService.save(dto).subscribe({
      next: () => { this.loading.set(false); this.success.set('Partido guardado'); this.cancelar(); this.cargar(); },
      error: err => { this.loading.set(false); this.error.set(err.error ?? 'Error al guardar partido'); }
    });
  }

  abrirNuevo(): void { this.limpiar(); this.showForm.set(true); }
  cancelar(): void { this.limpiar(); this.showForm.set(false); }

  editar(p: PartidoDTO): void {
    this.showForm.set(true);
    this.editMode.set(true);
    const fechaStr = p.fechaHora ? new Date(p.fechaHora).toISOString().slice(0, 16) : '';
    this.form.patchValue({
      idPartido: p.idPartido ?? null,
      idEquipoLocal: p.idEquipoLocal,
      idEquipoVisitante: p.idEquipoVisitante,
      fase: p.fase,
      golesLocal: p.golesLocal ?? null,
      golesVisitante: p.golesVisitante ?? null,
      fechaHora: fechaStr,
      estado: p.estado
    });
  }

  eliminar(id: number): void {
    if (!window.confirm('¿Está seguro que desea eliminar este partido?')) return;
    this.partidoService.delete(id).subscribe({
      next: () => { this.success.set('Partido eliminado'); this.cargar(); },
      error: () => this.error.set('Error al eliminar partido')
    });
  }

  limpiar(): void {
    this.form.reset({ estado: 'A' });
    this.editMode.set(false);
    this.error.set(null);
    this.success.set(null);
  }
}
