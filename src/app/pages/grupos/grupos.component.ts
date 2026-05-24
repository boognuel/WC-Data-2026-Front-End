import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GrupoService } from '../../services/grupo.service';
import { GrupoDTO } from '../../models/grupo.model';

@Component({
  selector: 'app-grupos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './grupos.component.html',
  styleUrl: './grupos.component.css'
})
export class GruposComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly grupoService = inject(GrupoService);
  private readonly auth = inject(AuthService);

  readonly grupos = signal<GrupoDTO[]>([]);
  readonly editMode = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loading = signal(false);

  readonly form = this.fb.group({
    idGrupo: ['', [Validators.required, Validators.maxLength(1)]],
    descripcion: ['', Validators.required],
    estado: ['A', Validators.required]
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.grupoService.getAll().subscribe({
      next: d => this.grupos.set(d),
      error: () => this.error.set('Error al cargar grupos')
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    const dto = this.form.value as GrupoDTO;
    this.grupoService.save(dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Grupo guardado correctamente');
        this.limpiar();
        this.cargar();
      },
      error: err => {
        this.loading.set(false);
        this.error.set(typeof err.error === 'string' ? err.error : 'Error al guardar grupo');
      }
    });
  }

  editar(g: GrupoDTO): void {
    this.editMode.set(true);
    this.form.patchValue({
      idGrupo: g.idGrupo,
      descripcion: g.descripcion,
      estado: g.estado
    });
    this.form.get('idGrupo')?.disable();
  }

  eliminar(id: string): void {
    this.error.set(null);
    this.success.set(null);
    this.grupoService.delete(id).subscribe({
      next: () => { this.success.set('Grupo eliminado'); this.cargar(); },
      error: () => this.error.set('Error al eliminar grupo')
    });
  }

  limpiar(): void {
    this.form.reset({ estado: 'A' });
    this.form.get('idGrupo')?.enable();
    this.editMode.set(false);
    this.error.set(null);
    this.success.set(null);
  }

  salir(): void { this.auth.logout(); }
}