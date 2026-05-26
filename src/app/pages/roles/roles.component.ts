import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolService } from '../../services/rol.service';
import { RolDTO } from '../../models/rol.model';

@Component({
    selector: 'app-roles',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule],
    templateUrl: './roles.component.html',
    styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly rolService = inject(RolService);

    readonly roles = signal<RolDTO[]>([]);
    readonly editMode = signal(false);
    readonly showForm = signal(false);
    readonly error = signal<string | null>(null);
    readonly success = signal<string | null>(null);
    readonly loading = signal(false);
    readonly page = signal(0);
    readonly pageSize = 10;
    readonly paginados = computed(() =>
        this.roles().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize)
    );
    readonly totalPages = computed(() =>
        Math.max(1, Math.ceil(this.roles().length / this.pageSize))
    );

    readonly form = this.fb.group({
        idRol: [null as number | null],
        nombreRol: ['', Validators.required],
        estado: ['A']
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
            next: () => { this.loading.set(false); this.success.set('Rol guardado'); this.cancelar(); this.cargar(); },
            error: err => { this.loading.set(false); this.error.set(err.error ?? 'Error al guardar rol'); }
        });
    }

    abrirNuevo(): void { this.limpiar(); this.showForm.set(true); }
    cancelar(): void { this.limpiar(); this.showForm.set(false); }

    editar(r: RolDTO): void {
        this.showForm.set(true);
        this.editMode.set(true);
        this.form.patchValue({ idRol: r.idRol ?? null, nombreRol: r.nombreRol, estado: r.estado });
    }

    eliminar(id: number): void {
        if (!window.confirm('¿Está seguro que desea eliminar este rol?')) return;
        this.rolService.delete(id).subscribe({
            next: () => { this.success.set('Rol eliminado'); this.cargar(); },
            error: () => this.error.set('Error al eliminar rol')
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