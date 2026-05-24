import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ParametroService } from '../../services/parametro.service';
import { ParametroDTO } from '../../models/parametro.model';

@Component({
  selector: 'app-parametros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './parametros.component.html',
  styleUrl: './parametros.component.css'
})
export class ParametrosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly parametroService = inject(ParametroService);
  private readonly auth = inject(AuthService);

  readonly parametros = signal<ParametroDTO[]>([]);
  readonly editMode = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loading = signal(false);

  readonly form = this.fb.group({
    idParametro: [null as number | null],
    descripcion: ['', Validators.required],
    valorTexto: ['', Validators.required],
    valorNumero: [null as number | null],
    fechaInicial: [''],
    fechaFinal: [''],
    estado: ['A', Validators.required]
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
    const dto = this.form.value as ParametroDTO;
    this.parametroService.save(dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Parámetro guardado correctamente');
        this.limpiar();
        this.cargar();
      },
      error: err => {
        this.loading.set(false);
        this.error.set(typeof err.error === 'string' ? err.error : 'Error al guardar parámetro');
      }
    });
  }

  editar(p: ParametroDTO): void {
    this.editMode.set(true);
    this.form.patchValue({
      idParametro: p.idParametro ?? null,
      descripcion: p.descripcion,
      valorTexto: p.valorTexto,
      valorNumero: p.valorNumero ?? null,
      fechaInicial: p.fechaInicial ?? '',
      fechaFinal: p.fechaFinal ?? '',
      estado: p.estado
    });
  }

  eliminar(id: number): void {
    this.error.set(null);
    this.success.set(null);
    this.parametroService.delete(id).subscribe({
      next: () => { this.success.set('Parámetro eliminado'); this.cargar(); },
      error: () => this.error.set('Error al eliminar parámetro')
    });
  }

  limpiar(): void {
    this.form.reset({ estado: 'A' });
    this.editMode.set(false);
    this.error.set(null);
    this.success.set(null);
  }

  salir(): void { this.auth.logout(); }
}