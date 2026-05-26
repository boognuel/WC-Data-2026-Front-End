import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
    selector: 'app-registro',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './registro.component.html',
    styleUrl: './registro.component.css'
})
export class RegistroComponent {
    private readonly fb = inject(FormBuilder);
    private readonly usuarioService = inject(UsuarioService);
    private readonly router = inject(Router);

    readonly error = signal<string | null>(null);
    readonly success = signal<string | null>(null);
    readonly loading = signal(false);

    readonly form = this.fb.group({
        username: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]],
        nombreapellido: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
    });

    registrar(): void {
        if (this.form.invalid) return;
        this.loading.set(true);
        this.error.set(null);
        this.success.set(null);
        const raw = this.form.value;
        this.usuarioService.registro({
            username: raw.username!,
            password: raw.password!,
            nombreapellido: raw.nombreapellido!,
            idRol: 3,
            email: raw.email!
        }).subscribe({
            next: () => {
                this.loading.set(false);
                this.success.set('Registro exitoso. Revisa tu correo para tus credenciales.');
                setTimeout(() => this.router.navigate(['/login']), 2500);
            },
            error: err => {
                this.loading.set(false);
                this.error.set(typeof err.error === 'string' ? err.error : 'Error al registrarse');
            }
        });
    }
}