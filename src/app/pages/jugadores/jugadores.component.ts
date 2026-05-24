import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EquipoService } from '../../services/equipo.service';
import { JugadorService } from '../../services/jugador.service';
import { EquipoDTO } from '../../models/equipo.model';
import { JugadorDTO } from '../../models/jugador.model';

@Component({
  selector: 'app-jugadores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './jugadores.component.html',
  styleUrl: './jugadores.component.css'
})
export class JugadoresComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly jugadorService = inject(JugadorService);
  private readonly equipoService = inject(EquipoService);
  private readonly auth = inject(AuthService);

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
  readonly paginados = computed(() => this.jugadores().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize));
  readonly totalPages = computed(() => Math.ceil(this.jugadores().length / this.pageSize));

  readonly form = this.fb.group({
    idJugador: [null as number | null],
    idEquipo: [null as number | null, Validators.required],
    nombre: ['', Validators.required],
    posicion: ['', Validators.required],
    numeroCamiseta: [null as number | null, Validators.required],
    fechaNacimiento: [''],
    foto: [''],
    estado: ['A']
  });

  ngOnInit(): void {
    this.cargar();
    this.cargarEquipos();
  }

  cargar(): void {
    this.jugadorService.getAll().subscribe({
      next: (data) => this.jugadores.set(data),
      error: () => this.error.set('Error al cargar jugadores')
    });
  }

  cargarEquipos(): void {
    this.equipoService.getAll().subscribe({
      next: (data) => this.equipos.set(data)
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    const dto = this.form.value as JugadorDTO;
    this.jugadorService.save(dto, this.selectedFile()).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Jugador guardado correctamente');
        this.cancelar();
        this.cargar();
      },
      error: (err) => {
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
      fechaNacimiento: j.fechaNacimiento ?? '',
      foto: j.foto ?? '',
      estado: j.estado
    });
  }

  nextPage(): void { if (this.page() < this.totalPages() - 1) this.page.update(p => p + 1); }
  prevPage(): void { if (this.page() > 0) this.page.update(p => p - 1); }

  eliminar(id: number): void {
    if (!window.confirm('¿Está seguro que desea eliminar este jugador?')) return;
    this.error.set(null);
    this.success.set(null);
    this.jugadorService.delete(id).subscribe({
      next: () => {
        this.success.set('Jugador eliminado');
        this.cargar();
      },
      error: () => this.error.set('Error al eliminar jugador')
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl.set(null);
    }
  }

  equipoNombre(idEquipo: number): string {
    return this.equipos().find(e => e.idEquipo === idEquipo)?.nombre ?? String(idEquipo);
  }

  limpiar(): void {
    this.form.reset({ estado: 'A' });
    this.editMode.set(false);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.error.set(null);
    this.success.set(null);
  }

  salir(): void {
    this.auth.logout();
  }
}
