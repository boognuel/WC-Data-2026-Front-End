import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EquipoService } from '../../services/equipo.service';
import { JugadorService } from '../../services/jugador.service';
import { EquipoDTO } from '../../models/equipo.model';
import { JugadorDTO } from '../../models/jugador.model';

@Component({
  selector: 'app-jugadores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './jugadores.component.html',
  styleUrl: './jugadores.component.css'
})
export class JugadoresComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly jugadorService = inject(JugadorService);
  private readonly equipoService = inject(EquipoService);

  readonly jugadores = signal<JugadorDTO[]>([]);
  readonly equipos = signal<EquipoDTO[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly editMode = signal(false);
  readonly showForm = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = 10;
  readonly paginados = computed(() =>
    this.jugadores().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize)
  );
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.jugadores().length / this.pageSize))
  );

  readonly form = this.fb.group({
    idJugador: [null as number | null],
    idEquipo: [null as number | null, Validators.required],
    nombre: ['', Validators.required],
    posicion: ['', Validators.required],
    numeroCamiseta: [null as number | null, Validators.required],
    fechaNacimiento: [''],
    estado: ['A'],
    foto: ['']
  });

  ngOnInit(): void { this.cargar(); this.cargarEquipos(); }

  cargar(): void {
    this.jugadorService.getAll().subscribe({
      next: data => this.jugadores.set(data),
      error: () => this.error.set('Error al cargar jugadores')
    });
  }

  cargarEquipos(): void {
    this.equipoService.getAll().subscribe({ next: data => this.equipos.set(data) });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    const raw = this.form.value;
    const dto: JugadorDTO = {
      ...raw,
      idEquipo: Number(raw.idEquipo),
      numeroCamiseta: Number(raw.numeroCamiseta),
      fechaNacimiento: raw.fechaNacimiento || null,
    } as JugadorDTO;
    this.jugadorService.save(dto, this.selectedFile()).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Jugador guardado correctamente');
        this.cancelar();
        this.cargar();
      },
      error: err => {
        this.loading.set(false);
        this.error.set(typeof err.error === 'string' ? err.error : 'Error al guardar jugador');
      }
    });
  }

  abrirNuevo(): void { this.limpiar(); this.showForm.set(true); }
  cancelar(): void { this.limpiar(); this.showForm.set(false); }

  editar(j: JugadorDTO): void {
    this.showForm.set(true);
    this.editMode.set(true);
    this.previewUrl.set(j.foto ?? null);
    this.form.patchValue({
      idJugador: j.idJugador ?? null,
      idEquipo: j.idEquipo,
      nombre: j.nombre,
      posicion: j.posicion,
      numeroCamiseta: j.numeroCamiseta,
      fechaNacimiento: j.fechaNacimiento ? String(j.fechaNacimiento).slice(0, 10) : '',
      estado: j.estado,
      foto: j.foto ?? ''
    });
  }

  eliminar(id: number): void {
    if (!window.confirm('¿Está seguro que desea eliminar este jugador?')) return;
    this.jugadorService.delete(id).subscribe({
      next: () => { this.success.set('Jugador eliminado'); this.cargar(); },
      error: () => this.error.set('Error al eliminar jugador')
    });
  }

  nextPage(): void { if (this.page() < this.totalPages() - 1) this.page.update(p => p + 1); }
  prevPage(): void { if (this.page() > 0) this.page.update(p => p - 1); }

  equipoNombre(idEquipo: number): string {
    return this.equipos().find(e => e.idEquipo === idEquipo)?.nombre ?? String(idEquipo);
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

  limpiar(): void {
    this.form.reset({ estado: 'A' });
    this.editMode.set(false);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.error.set(null);
    this.success.set(null);
  }
}