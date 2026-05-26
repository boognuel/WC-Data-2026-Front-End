import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EquipoService } from '../../services/equipo.service';
import { EquipoDTO } from '../../models/equipo.model';

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
    this.equipos().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize)
  );
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.equipos().length / this.pageSize))
  );

  readonly form = this.fb.group({
    idEquipo: [null as number | null],
    nombre: ['', Validators.required],
    idGrupo: ['', Validators.required],
    entrenador: ['', Validators.required],
    estado: ['A'],
    bandera: [''],
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.equipoService.getAll().subscribe({
      next: data => this.equipos.set(data),
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
        this.cancelar();
        this.cargar();
      },
      error: err => {
        this.loading.set(false);
        this.error.set(typeof err.error === 'string' ? err.error : 'Error al guardar equipo');
      }
    });
  }

  abrirNuevo(): void { this.limpiar(); this.showForm.set(true); }
  cancelar(): void { this.limpiar(); this.showForm.set(false); }

  editar(e: EquipoDTO): void {
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
      next: () => { this.success.set('Equipo eliminado'); this.page.set(0); this.cargar(); },
      error: () => this.error.set('Error al eliminar equipo')
    });
  }

  nextPage(): void { if (this.page() < this.totalPages() - 1) this.page.update(p => p + 1); }
  prevPage(): void { if (this.page() > 0) this.page.update(p => p - 1); }

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