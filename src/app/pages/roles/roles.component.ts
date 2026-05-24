import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RolService } from '../../services/rol.service';
import { RolDTO } from '../../models/rol.model';

@Component({
    selector: 'app-roles',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './roles.component.html',
    styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly rolService = inject(RolService);
    private readonly auth = inject(AuthService);

    readonly roles = signal<RolDTO[]>([]);
    readonly editMode = signal(false);
    readonly error = signal<string | null>(null);
    readonly success = signal<string | null>(null);
    readonly loading = signal(false);

    readonly form = this.fb.group({
        idRol: [null as number | null],
        nombreRol: ['', Validators.required],
        estado: ['A', Validators.required]
    });

    ngOnInit(): void { this.cargar(); }

    cargar(): void {
        this.rolService.getAll().subscribe({
            next: d => this.roles.set(d),
            error: () => this.error.set('Error al cargar roles')
        });
    }

    guardar(): void {
        if (this.form.invalid) return;
        this.loading.set(true);
        this.error.set(null);
        this.success.set(null);
        const dto = this.form.value as RolDTO;
        this.rolService.save(dto).subscribe({
            next: () => {
                this.loading.set(false);
                this.success.set('Rol guardado correctamente');
                this.limpiar();
                this.cargar();
            },
            error: err => {
                this.loading.set(false);
                this.error.set(typeof err.error === 'string' ? err.error : 'Error al guardar rol');
            }
        });
    }

    editar(r: RolDTO): void {
        this.editMode.set(true);
        this.form.patchValue({ idRol: r.idRol ?? null, nombreRol: r.nombreRol, estado: r.estado });
    }

    eliminar(id: number): void {
        this.error.set(null);
        this.success.set(null);
        this.rolService.delete(id).subscribe({
            next: () => { this.success.set('Rol eliminado'); this.cargar(); },
            error: () => this.error.set('Error al eliminar rol')
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