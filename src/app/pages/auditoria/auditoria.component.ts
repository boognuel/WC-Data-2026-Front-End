import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuditoriaService } from '../../services/auditoria.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuditoriaDTO } from '../../models/auditoria.model';
import { UsuarioResponseDTO } from '../../models/usuario.model';

@Component({
    selector: 'app-auditoria',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, DatePipe],
    templateUrl: './auditoria.component.html',
    styleUrl: './auditoria.component.css'
})
export class AuditoriaComponent implements OnInit {
    private readonly auditoriaService = inject(AuditoriaService);
    private readonly usuarioService = inject(UsuarioService);
    private readonly auth = inject(AuthService);

    readonly auditorias = signal<AuditoriaDTO[]>([]);
    readonly usuarios = signal<UsuarioResponseDTO[]>([]);
    readonly error = signal<string | null>(null);
    readonly page = signal(0);
    readonly pageSize = 15;
    readonly paginados = computed(() => this.auditorias().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize));
    readonly totalPages = computed(() => Math.max(1, Math.ceil(this.auditorias().length / this.pageSize)));

    ngOnInit(): void { this.cargar(); this.cargarUsuarios(); }

    cargar(): void {
        this.auditoriaService.getAll().subscribe({
            next: d => this.auditorias.set(d),
            error: () => this.error.set('Error al cargar auditorías')
        });
    }

    cargarUsuarios(): void {
        this.usuarioService.getAll().subscribe({ next: d => this.usuarios.set(d) });
    }

    usernameDe(idUsuario: number | null): string {
        if (idUsuario == null) return '—';
        return this.usuarios().find(u => u.idUsuario === idUsuario)?.username ?? String(idUsuario);
    }

    nextPage(): void { if (this.page() < this.totalPages() - 1) this.page.update(p => p + 1); }
    prevPage(): void { if (this.page() > 0) this.page.update(p => p - 1); }

    salir(): void { this.auth.logout(); }
}
