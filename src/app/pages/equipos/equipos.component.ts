import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EquipoService } from '../../services/equipo.service';
import { ReporteService } from '../../services/reporte.service';
import { AuthService } from '../../services/auth.service';
import { EquipoDTO } from '../../models/equipo.model';
import { EstadisticaDTO } from '../../models/estadistica.model';

interface EquipoConStats extends EquipoDTO {
  puntos: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  posicionGrupo: number;
}

@Component({
  selector: 'app-equipos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './equipos.component.html',
  styleUrl: './equipos.component.css'
})
export class EquiposComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly equipoService = inject(EquipoService);
  private readonly reporteService = inject(ReporteService);
  private readonly auth = inject(AuthService);

  readonly canManage = computed(() => this.auth.canManage());

  readonly equipos = signal<EquipoDTO[]>([]);
  readonly estadisticas = signal<EstadisticaDTO[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly editMode = signal(false);
  readonly showForm = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loading = signal(false);
  readonly grupoFiltro = signal<string>('TODOS');
  readonly busqueda = signal<string>('');

  readonly grupos = computed(() => {
    const setGr = new Set(this.equipos().map(e => e.idGrupo).filter(Boolean) as string[]);
    return Array.from(setGr).sort();
  });

  readonly equiposConStats = computed<EquipoConStats[]>(() => {
    const stats = this.estadisticas();
    const enriched = this.equipos().map(e => {
      const s = stats.find(st => st.nombreEquipo === e.nombre);
      return {
        ...e,
        puntos: s?.puntos ?? 0,
        ganados: s?.partidosGanados ?? 0,
        empatados: s?.partidosEmpatados ?? 0,
        perdidos: s?.partidosPerdidos ?? 0,
        posicionGrupo: 0,
      };
    });
    const porGrupo = new Map<string, EquipoConStats[]>();
    for (const eq of enriched) {
      const g = eq.idGrupo ?? '';
      if (!porGrupo.has(g)) porGrupo.set(g, []);
      porGrupo.get(g)!.push(eq);
    }
    for (const lista of porGrupo.values()) {
      lista.sort((a, b) => b.puntos - a.puntos);
      lista.forEach((eq, i) => eq.posicionGrupo = i + 1);
    }
    return enriched;
  });

  readonly filtrados = computed(() => {
    const grupo = this.grupoFiltro();
    const q = this.busqueda().trim().toLowerCase();
    return this.equiposConStats()
      .filter(e => grupo === 'TODOS' || e.idGrupo === grupo)
      .filter(e => !q || (e.nombre ?? '').toLowerCase().includes(q))
      .sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es'));
  });

  readonly form = this.fb.group({
    idEquipo: [null as number | null],
    nombre: ['', Validators.required],
    idGrupo: ['', Validators.required],
    entrenador: ['', Validators.required],
    estado: ['A'],
    bandera: [''],
  });

  ngOnInit(): void {
    this.cargar();
    this.cargarStats();
  }

  cargar(): void {
    this.equipoService.getAll().subscribe({
      next: data => this.equipos.set(data),
      error: () => this.error.set('Error al cargar equipos')
    });
  }

  cargarStats(): void {
    this.reporteService.getEstadisticas().subscribe({
      next: data => this.estadisticas.set(data),
      error: () => { /* sin stats: mostramos 0 */ }
    });
  }

  setGrupoFiltro(g: string): void { this.grupoFiltro.set(g); }
  onBuscar(e: Event): void { this.busqueda.set((e.target as HTMLInputElement).value); }

  guardar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    const dto = this.form.value as EquipoDTO;
    this.equipoService.save(dto, this.selectedFile()).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Equipo guardado correctamente');
        this.cancelar();
        this.cargar();
        this.cargarStats();
      },
      error: err => {
        this.loading.set(false);
        this.error.set(typeof err.error === 'string' ? err.error : 'Error al guardar equipo');
      }
    });
  }

  abrirNuevo(): void { this.limpiar(); this.showForm.set(true); }
  cancelar(): void { this.limpiar(); this.showForm.set(false); }

  editar(e: EquipoConStats | EquipoDTO): void {
    this.showForm.set(true);
    this.editMode.set(true);
    this.previewUrl.set(e.bandera ?? null);
    this.form.patchValue({
      idEquipo: e.idEquipo ?? null,
      nombre: e.nombre,
      idGrupo: e.idGrupo,
      entrenador: e.entrenador,
      estado: e.estado,
      bandera: e.bandera ?? ''
    });
  }

  eliminar(id: number): void {
    if (!window.confirm('¿Está seguro que desea eliminar este equipo?')) return;
    this.error.set(null);
    this.success.set(null);
    this.equipoService.delete(id).subscribe({
      next: () => { this.success.set('Equipo eliminado'); this.cargar(); this.cargarStats(); },
      error: () => this.error.set('Error al eliminar equipo')
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile.set(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl.set(null);
    }
  }

  posColor(pos: number): string {
    if (pos <= 2) return 'pos-green';
    if (pos === 3) return 'pos-yellow';
    return 'pos-red';
  }

  limpiar(): void {
    this.form.reset({ estado: 'A' });
    this.editMode.set(false);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.error.set(null);
    this.success.set(null);
  }
}
