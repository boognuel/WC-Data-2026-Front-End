import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface NavItem {
    label: string;
    icon: string;
    route: string;
    requiredRoles?: number[];
}

@Component({
    selector: 'app-main-layout',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
    private readonly auth = inject(AuthService);

    readonly collapsed = signal(false);

    readonly userName = computed(
        () => this.auth.currentUser()?.nombreapellido ?? 'Usuario'
    );

    readonly roleName = computed(() => {
        const id = this.auth.currentUser()?.idRol;
        if (id === 1) return 'Administrador';
        if (id === 2) return 'Operario';
        return 'Usuario Externo';
    });

    private readonly allNav: NavItem[] = [
        { label: 'Equipos', icon: '🏟️', route: '/equipos' },
        { label: 'Jugadores', icon: '⚽', route: '/jugadores' },
        { label: 'Estadios', icon: '🏗️', route: '/estadios' },
        { label: 'Grupos', icon: '🔤', route: '/grupos' },
        { label: 'Partidos', icon: '📅', route: '/partidos' },
        { label: 'Reportes', icon: '📊', route: '/reportes' },
        { label: 'Parámetros', icon: '⚙️', route: '/parametros', requiredRoles: [1] },
        { label: 'Roles', icon: '🔑', route: '/roles', requiredRoles: [1] },
        { label: 'Usuarios', icon: '👤', route: '/usuarios', requiredRoles: [1] },
        { label: 'Auditoría', icon: '📜', route: '/auditoria', requiredRoles: [1] },
    ];

    readonly visibleNav = computed(() => {
        const roleId = this.auth.currentUser()?.idRol ?? 0;
        return this.allNav.filter(item =>
            !item.requiredRoles || item.requiredRoles.includes(roleId)
        );
    });

    toggleSidebar(): void {
        this.collapsed.update(v => !v);
    }

    logout(): void {
        this.auth.logout();
    }
}