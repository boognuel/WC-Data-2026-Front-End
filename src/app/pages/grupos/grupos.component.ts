import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GrupoService } from '../../services/grupo.service';
import { AuthService } from '../../services/auth.service';
import { GrupoDTO } from '../../models/grupo.model';

@Component({
  selector: 'app-grupos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './grupos.component.html',
  styleUrl: './grupos.component.css'
})
export class GruposComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly grupoService = inject(GrupoService);
  private readonly auth = inject(AuthService);

  readonly canManage = computed(() => this.auth.canManage());

  readonly grupos = signal<GrupoDTO[]>([]);
  readonly editMode = signal(false);
  readonly showForm = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = 10;
  readonly paginados = computed(() =>
    this.grupos().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize)
  );
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.grupos().length / this.pageSize))
  );

  readonly form = this.fb.group({
    idGrupo: ['', [Validators.required, Validators.maxLength(1), Validators.pattern(/^[A-Za-z]$/)]],
    descripcion: ['', Validators.required],
    estado: ['A']
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
    // Normalizar a mayúscula
    dto.idGrupo = dto.idGrupo.toUpperCase();
    this.grupoService.save(dto).subscribe({
      next: () => { this.loading.set(false); this.success.set('Grupo guardado'); this.cancelar(); this.cargar(); },
      error: err => { this.loading.set(false); this.error.set(err.error ?? 'Error al guardar'); }
    });
  }

  abrirNuevo(): void { this.limpiar(); this.showForm.set(true); }
  cancelar(): void { this.limpiar(); this.showForm.set(false); }

  editar(g: GrupoDTO): void {
    this.showForm.set(true);
    this.editMode.set(true);
    this.form.patchValue({ idGrupo: g.idGrupo, descripcion: g.descripcion, estado: g.estado });
    this.form.get('idGrupo')?.disable();
  }

  eliminar(id: string): void {
    if (!window.confirm('¿Está seguro que desea eliminar este grupo?')) return;
    this.grupoService.delete(id).subscribe({
      next: () => { this.success.set('Grupo eliminado'); this.cargar(); },
      error: () => this.error.set('Error al eliminar grupo')
    });
  }

  nextPage(): void { if (this.page() < this.totalPages() - 1) this.page.update(p => p + 1); }
  prevPage(): void { if (this.page() > 0) this.page.update(p => p - 1); }

  limpiar(): void {
    this.form.reset({ estado: 'A' });
    this.form.get('idGrupo')?.enable();
    this.editMode.set(false);
    this.error.set(null);
    this.success.set(null);
  }
}