import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { WcLogoComponent } from '../../shared/wc-logo/wc-logo.component';

@Component({
    selector: 'app-cambiar-contrasena',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, WcLogoComponent],
    templateUrl: './cambiar-contrasena.component.html',
    styleUrl: './cambiar-contrasena.component.css'
})
export class CambiarContrasenaComponent {
    private readonly fb = inject(FormBuilder);
    private readonly usuarioService = inject(UsuarioService);
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);

    readonly error = signal<string | null>(null);
    readonly loading = signal(false);

    // username viene del estado de navegación o del currentUser
    readonly pendingUsername = (history.state as any)?.username ?? '';

    readonly form = this.fb.group({
        username: [this.pendingUsername, Validators.required],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]]
    });

    cambiar(): void {
        if (this.form.invalid) return;
        this.loading.set(true);
        this.error.set(null);
        const raw = this.form.value;
        // Sólo se envían username y password — la firma de cambiarContrasena lo espera así
        this.usuarioService.cambiarContrasena({
            username: raw.username!,
            password: raw.password!
        }).subscribe({
            next: (user) => {
                this.loading.set(false);
                this.auth.setUser(user);
                this.router.navigate(['/equipos']);
            },
            error: err => {
                this.loading.set(false);
                this.error.set(typeof err.error === 'string' ? err.error : 'Error al cambiar contraseña');
            }
        });
    }
}