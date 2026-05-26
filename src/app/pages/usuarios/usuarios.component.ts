import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { RolService } from '../../services/rol.service';
import { UsuarioResponseDTO, UsuarioRequestDTO } from '../../models/usuario.model';
import { RolDTO } from '../../models/rol.model';

@Component({
  selector: 'app-usuarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService = inject(RolService);

  readonly usuarios = signal<UsuarioResponseDTO[]>([]);
  readonly roles = signal<RolDTO[]>([]);
  readonly editMode = signal(false);
  readonly showForm = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = 10;
  readonly paginados = computed(() =>
    this.usuarios().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize)
  );
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.usuarios().length / this.pageSize))
  );

  readonly form = this.fb.group({
    idUsuario: [null as number | null],
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]],
    nombreapellido: ['', Validators.required],
    idRol: [null as number | null, Validators.required]
  });

  ngOnInit(): void { this.cargar(); this.cargarRoles(); }

  cargar(): void {
    this.usuarioService.getAll().subscribe({
      next: d => this.usuarios.set(d),
      error: () => this.error.set('Error al cargar usuarios')
    });
  }

  cargarRoles(): void {
    this.rolService.getAll().subscribe({ next: d => this.roles.set(d) });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    const raw = this.form.value;
    const dto: UsuarioRequestDTO = {
      idUsuario: raw.idUsuario ?? undefined,
      username: raw.username!,
      password: raw.password!,
      nombreapellido: raw.nombreapellido!,
      idRol: Number(raw.idRol)
    };
    this.usuarioService.save(dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Usuario guardado. Se enviaron credenciales por correo.');
        this.cancelar();
        this.cargar();
      },
      error: err => {
        this.loading.set(false);
        this.error.set(typeof err.error === 'string' ? err.error : 'Error al guardar usuario');
      }
    });
  }

  abrirNuevo(): void { this.limpiar(); this.showForm.set(true); }
  cancelar(): void { this.limpiar(); this.showForm.set(false); }

  editar(u: UsuarioResponseDTO): void {
    this.showForm.set(true);
    this.editMode.set(true);
    // En edición no se cambia contraseña — se pone valor dummy para pasar validación
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.form.patchValue({
      idUsuario: u.idUsuario ?? null,
      username: u.username,
      password: '——',
      nombreapellido: u.nombreapellido,
      idRol: u.idRol ?? null
    });
    this.form.get('username')?.disable();
    this.form.get('password')?.disable();
  }

  desbloquear(id: number): void {
    if (!window.confirm('¿Desbloquear este usuario?')) return;
    this.error.set(null);
    this.success.set(null);
    this.usuarioService.desbloquear(id).subscribe({
      next: () => { this.success.set('Usuario desbloqueado correctamente'); this.cargar(); },
      error: () => this.error.set('Error al desbloquear usuario')
    });
  }

  eliminar(id: number): void {
    if (!window.confirm('¿Está seguro que desea eliminar este usuario?')) return;
    this.usuarioService.delete(id).subscribe({
      next: () => { this.success.set('Usuario eliminado'); this.cargar(); },
      error: () => this.error.set('Error al eliminar usuario')
    });
  }

  nextPage(): void { if (this.page() < this.totalPages() - 1) this.page.update(p => p + 1); }
  prevPage(): void { if (this.page() > 0) this.page.update(p => p - 1); }

  rolNombre(idRol: number | null | undefined): string {
    if (idRol == null) return '—';
    return this.roles().find(r => r.idRol === idRol)?.nombreRol ?? String(idRol);
  }

  limpiar(): void {
    this.form.reset();
    this.form.get('username')?.enable();
    this.form.get('password')?.enable();
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(8)]);
    this.form.get('password')?.updateValueAndValidity();
    this.editMode.set(false);
    this.error.set(null);
    this.success.set(null);
  }
}