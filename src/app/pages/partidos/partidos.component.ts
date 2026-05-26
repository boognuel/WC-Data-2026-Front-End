import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PartidoService } from '../../services/partido.service';
import { EquipoService } from '../../services/equipo.service';
import { PartidoDTO } from '../../models/partido.model';
import { EquipoDTO } from '../../models/equipo.model';

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
  readonly page = signal(0);
  readonly pageSize = 10;
  readonly paginados = computed(() =>
    this.partidos().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize)
  );
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.partidos().length / this.pageSize))
  );

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

  ngOnInit(): void { this.cargar(); this.cargarEquipos(); }

  cargar(): void {
    this.partidoService.getAll().subscribe({
      next: d => this.partidos.set(d),
      error: () => this.error.set('Error al cargar partidos')
    });
  }

  cargarEquipos(): void {
    this.equipoService.getAll().subscribe({ next: d => this.equipos.set(d) });
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

  nextPage(): void { if (this.page() < this.totalPages() - 1) this.page.update(p => p + 1); }
  prevPage(): void { if (this.page() > 0) this.page.update(p => p - 1); }

  equipoNombre(id: number | null | undefined): string {
    if (id == null) return '—';
    return this.equipos().find(e => e.idEquipo === id)?.nombre ?? String(id);
  }

  limpiar(): void {
    this.form.reset({ estado: 'A' });
    this.editMode.set(false);
    this.error.set(null);
    this.success.set(null);
  }
}