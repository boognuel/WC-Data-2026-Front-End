import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EquipoService } from '../../services/equipo.service';
import { EquipoDTO } from '../../models/equipo.model';

@Component({
  selector: 'app-equipos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './equipos.component.html',
  styleUrl: './equipos.component.css'
})
export class EquiposComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly equipoService = inject(EquipoService);
  private readonly auth = inject(AuthService);

  readonly equipos = signal<EquipoDTO[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly editMode = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loading = signal(false);

  readonly form = this.fb.group({
    idEquipo: [null as number | null],
    nombre: ['', Validators.required],
    idGrupo: ['', Validators.required],
    entrenador: ['', Validators.required],
    estado: ['A', Validators.required],
    bandera: [''],
    externalId: ['']
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.equipoService.getAll().subscribe({
      next: (data) => this.equipos.set(data),
      error: () => this.error.set('Error al cargar equipos')
    });
  }

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
        this.limpiar();
        this.cargar();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(typeof err.error === 'string' ? err.error : 'Error al guardar equipo');
      }
    });
  }

  editar(e: EquipoDTO): void {
    this.editMode.set(true);
    this.previewUrl.set(e.bandera ?? null);
    this.form.patchValue({
      idEquipo: e.idEquipo ?? null,
      nombre: e.nombre,
      idGrupo: e.idGrupo,
      entrenador: e.entrenador,
      estado: e.estado,
      bandera: e.bandera ?? '',
      externalId: e.externalId ?? ''
    });
  }

  eliminar(id: number): void {
    this.error.set(null);
    this.success.set(null);
    this.equipoService.delete(id).subscribe({
      next: () => {
        this.success.set('Equipo eliminado');
        this.cargar();
      },
      error: () => this.error.set('Error al eliminar equipo')
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
