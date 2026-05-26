import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParametroService } from '../../services/parametro.service';
import { ParametroDTO } from '../../models/parametro.model';

@Component({
  selector: 'app-parametros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './parametros.component.html',
  styleUrl: './parametros.component.css'
})
export class ParametrosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly parametroService = inject(ParametroService);

  readonly parametros = signal<ParametroDTO[]>([]);
  readonly editMode = signal(false);
  readonly showForm = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = 10;
  readonly paginados = computed(() =>
    this.parametros().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize)
  );
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.parametros().length / this.pageSize))
  );

  readonly form = this.fb.group({
    idParametro: [null as number | null],
    descripcion: ['', Validators.required],
    valorTexto: ['', Validators.required],
    valorNumero: [null as number | null],
    fechaInicial: [''],
    fechaFinal: [''],
    estado: ['A']
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.parametroService.getAll().subscribe({
      next: d => this.parametros.set(d),
      error: () => this.error.set('Error al cargar parámetros')
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    const raw = this.form.value;
    const dto: ParametroDTO = {
      ...raw,
      valorNumero: raw.valorNumero !== null && raw.valorNumero !== undefined ? Number(raw.valorNumero) : null,
      fechaInicial: raw.fechaInicial ? new Date(raw.fechaInicial) : null,
      fechaFinal: raw.fechaFinal ? new Date(raw.fechaFinal) : null,
    } as ParametroDTO;
    this.parametroService.save(dto).subscribe({
      next: () => { this.loading.set(false); this.success.set('Parámetro guardado'); this.cancelar(); this.cargar(); },
      error: err => { this.loading.set(false); this.error.set(err.error ?? 'Error al guardar parámetro'); }
    });
  }

  abrirNuevo(): void { this.limpiar(); this.showForm.set(true); }
  cancelar(): void { this.limpiar(); this.showForm.set(false); }

  editar(p: ParametroDTO): void {
    this.showForm.set(true);
    this.editMode.set(true);
    const toDateStr = (d: Date | null | undefined) => d ? new Date(d).toISOString().slice(0, 10) : '';
    this.form.patchValue({
      idParametro: p.idParametro ?? null,
      descripcion: p.descripcion,
      valorTexto: p.valorTexto ?? '',
      valorNumero: p.valorNumero ?? null,
      fechaInicial: toDateStr(p.fechaInicial),
      fechaFinal: toDateStr(p.fechaFinal),
      estado: p.estado
    });
  }

  eliminar(id: number): void {
    if (!window.confirm('¿Está seguro que desea eliminar este parámetro?')) return;
    this.parametroService.delete(id).subscribe({
      next: () => { this.success.set('Parámetro eliminado'); this.cargar(); },
      error: () => this.error.set('Error al eliminar parámetro')
    });
  }

  nextPage(): void { if (this.page() < this.totalPages() - 1) this.page.update(p => p + 1); }
  prevPage(): void { if (this.page() > 0) this.page.update(p => p - 1); }

  limpiar(): void {
    this.form.reset({ estado: 'A' });
    this.editMode.set(false);
    this.error.set(null);
    this.success.set(null);
  }
}