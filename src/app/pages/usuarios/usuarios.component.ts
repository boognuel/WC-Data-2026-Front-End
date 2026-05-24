import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { RolService } from '../../services/rol.service';
import { UsuarioResponse } from '../../models/usuario.model';
import { RolDTO } from '../../models/rol.model';

@Component({
  selector: 'app-usuarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService = inject(RolService);
  private readonly auth = inject(AuthService);

  readonly usuarios = signal<UsuarioResponse[]>([]);
  readonly roles = signal<RolDTO[]>([]);
  readonly editMode = signal(false);
  readonly showForm = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = 10;
  readonly paginados = computed(() => this.usuarios().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize));
  readonly totalPages = computed(() => Math.ceil(this.usuarios().length / this.pageSize));

  readonly form = this.fb.group({
    idUsuario: [null as number | null],
    username: ['', Validators.required],
    password: [''],
    nombreapellido: ['', Validators.required],
    idRol: [null as number | null, Validators.required]
  });

  ngOnInit(): void {
    this.cargar();
    this.cargarRoles();
  }

  cargar(): void {
    this.usuarioService.getAll().subscribe({
      next: d => this.usuarios.set(d),
      error: () => this.error.set('Error al cargar usuarios')
    });
  }

  cargarRoles(): void {
    this.rolService.getAll().subscribe({
      next: d => this.roles.set(d)
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    const raw = this.form.value;
    const dto: any = {
      idUsuario: raw.idUsuario ?? undefined,
      username: raw.username,
      password: raw.password ?? '',
      nombreapellido: raw.nombreapellido,
      idRol: raw.idRol
    };
    this.usuarioService.save(dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Usuario guardado correctamente');
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

  editar(u: UsuarioResponse): void {
    this.showForm.set(true);
    this.editMode.set(true);
    this.form.patchValue({
      idUsuario: u.idUsuario,
      username: u.username,
      password: '',
      nombreapellido: u.nombreapellido,
      idRol: u.idRol
    });
    this.form.get('username')?.disable();
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
  }

  nextPage(): void { if (this.page() < this.totalPages() - 1) this.page.update(p => p + 1); }
  prevPage(): void { if (this.page() > 0) this.page.update(p => p - 1); }

  eliminar(id: number): void {
    if (!window.confirm('¿Está seguro que desea eliminar este usuario?')) return;
    this.error.set(null);
    this.success.set(null);
    this.usuarioService.delete(id).subscribe({
      next: () => { this.success.set('Usuario eliminado'); this.cargar(); },
      error: () => this.error.set('Error al eliminar usuario')
    });
  }

  desbloquear(id: number): void {
    this.error.set(null);
    this.success.set(null);
    this.usuarioService.desbloquear(id).subscribe({
      next: () => { this.success.set('Usuario desbloqueado'); this.cargar(); },
      error: () => this.error.set('Error al desbloquear usuario')
    });
  }

  rolNombre(id: number): string {
    return this.roles().find(r => r.idRol === id)?.nombreRol ?? String(id);
  }

  limpiar(): void {
    this.form.reset();
    this.form.get('username')?.enable();
    this.form.get('password')?.setValidators(Validators.required);
    this.form.get('password')?.updateValueAndValidity();
    this.editMode.set(false);
    this.error.set(null);
    this.success.set(null);
  }

  salir(): void { this.auth.logout(); }
}