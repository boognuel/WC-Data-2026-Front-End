import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EstadioService } from '../../services/estadio.service';
import { EstadioDTO } from '../../models/estadio.model';

@Component({
  selector: 'app-estadios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './estadios.component.html',
  styleUrl: './estadios.component.css'
})
export class EstadiosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly estadioService = inject(EstadioService);
  private readonly auth = inject(AuthService);

  readonly estadios = signal<EstadioDTO[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly editMode = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loading = signal(false);

  readonly form = this.fb.group({
    idEstadio: [null as number | null],
    descripcion: ['', Validators.required],
    imagen: [''],
    estado: ['A', Validators.required]
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.estadioService.getAll().subscribe({
      next: d => this.estadios.set(d),
      error: () => this.error.set('Error al cargar estadios')
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    const dto = this.form.value as EstadioDTO;
    this.estadioService.save(dto, this.selectedFile()).subscribe({
      next: () => { this.loading.set(false); this.success.set('Estadio guardado'); this.limpiar(); this.cargar(); },
      error: err => { this.loading.set(false); this.error.set(err.error ?? 'Error al guardar'); }
    });
  }

  editar(e: EstadioDTO): void {
    this.editMode.set(true);
    this.previewUrl.set(e.imagen ?? null);
    this.form.patchValue({ idEstadio: e.idEstadio ?? null, descripcion: e.descripcion, imagen: e.imagen ?? '', estado: e.estado });
  }

  eliminar(id: number): void {
    this.estadioService.delete(id).subscribe({
      next: () => { this.success.set('Estadio eliminado'); this.cargar(); },
      error: () => this.error.set('Error al eliminar')
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile.set(file);
    if (file) { const r = new FileReader(); r.onload = e => this.previewUrl.set(e.target?.result as string); r.readAsDataURL(file); }
    else this.previewUrl.set(null);
  }

  limpiar(): void {
    this.form.reset({ estado: 'A' });
    this.editMode.set(false);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.error.set(null);
    this.success.set(null);
  }

  salir(): void { this.auth.logout(); }
}