import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
    template: `
    <div class="shell">
      <!-- SIDEBAR -->
      <aside class="sidebar" [class.collapsed]="collapsed()">
        <!-- Header -->
        <div class="sb-header">
          <span class="sb-logo">⚽</span>
          @if (!collapsed()) {
            <span class="sb-brand">Mundial 2026</span>
          }
          <button
            class="sb-toggle"
            type="button"
            (click)="toggleSidebar()"
            [attr.aria-label]="collapsed() ? 'Expandir menú' : 'Colapsar menú'"
          >
            {{ collapsed() ? '›' : '‹' }}
          </button>
        </div>

        <!-- Navigation -->
        <nav class="sb-nav" aria-label="Menú principal">
          @for (item of visibleNav(); track item.route) {
            
              class="sb-item"
              [routerLink]="item.route"
              routerLinkActive="sb-active"
              [title]="item.label"
              [attr.aria-label]="item.label"
            >
              <span class="sb-icon">{{ item.icon }}</span>
              @if (!collapsed()) {
                <span class="sb-label">{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <!-- Footer / user -->
        <div class="sb-footer">
          @if (!collapsed()) {
            <div class="sb-user">
              <span class="sb-username">{{ userName() }}</span>
              <span class="sb-role">{{ roleName() }}</span>
            </div>
          }
          <button
            class="sb-logout"
            type="button"
            (click)="logout()"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <span class="sb-icon">🚪</span>
            @if (!collapsed()) {
              <span>Cerrar sesión</span>
            }
          </button>
        </div>
      </aside>

      <!-- CONTENT -->
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
    styles: [
        `
      /* ── Shell ── */
      .shell {
        display: flex;
        min-height: 100vh;
        background: #000;
      }

      /* ── Sidebar ── */
      .sidebar {
        width: 220px;
        min-width: 220px;
        background: #0d0d0d;
        border-right: 2px solid #ff4800;
        display: flex;
        flex-direction: column;
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
        transition: width 0.25s ease, min-width 0.25s ease;
        z-index: 200;
        flex-shrink: 0;
      }

      .sidebar.collapsed {
        width: 56px;
        min-width: 56px;
      }

      /* Header */
      .sb-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 14px 10px;
        border-bottom: 1px solid #1a1a1a;
        min-height: 60px;
      }

      .sb-logo {
        font-size: 1.4rem;
        flex-shrink: 0;
      }

      .sb-brand {
        color: #ff4800;
        font-weight: 700;
        font-size: 0.9rem;
        white-space: nowrap;
        flex: 1;
        overflow: hidden;
      }

      .sb-toggle {
        background: transparent;
        border: 1px solid #333;
        color: #aaa;
        cursor: pointer;
        border-radius: 4px;
        padding: 1px 7px;
        font-size: 1.1rem;
        flex-shrink: 0;
        margin-left: auto;
        line-height: 1.4;
        transition: border-color 0.2s, color 0.2s;
      }

      .sb-toggle:hover {
        border-color: #ff4800;
        color: #ff4800;
      }

      /* Nav */
      .sb-nav {
        flex: 1;
        padding: 10px 6px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        overflow-y: auto;
      }

      .sb-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 10px;
        border-radius: 7px;
        color: #999;
        text-decoration: none;
        transition: background 0.18s, color 0.18s;
        white-space: nowrap;
        overflow: hidden;
      }

      .sb-item:hover {
        background: #1a0800;
        color: #ddd;
      }

      .sb-item.sb-active {
        background: #ff4800;
        color: #fff;
        font-weight: 700;
      }

      .sb-icon {
        font-size: 1.1rem;
        flex-shrink: 0;
        width: 22px;
        text-align: center;
      }

      .sb-label {
        font-size: 0.85rem;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Separator label */
      .sb-section {
        padding: 8px 10px 2px;
        font-size: 0.68rem;
        color: #555;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        white-space: nowrap;
      }

      /* Footer */
      .sb-footer {
        padding: 10px 6px;
        border-top: 1px solid #1a1a1a;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .sb-user {
        padding: 4px 6px;
        overflow: hidden;
      }

      .sb-username {
        display: block;
        color: #ddd;
        font-size: 0.82rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sb-role {
        display: block;
        color: #ff4800;
        font-size: 0.72rem;
        margin-top: 1px;
      }

      .sb-logout {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px 10px;
        background: transparent;
        border: 1px solid #5a0000;
        color: #e50000;
        cursor: pointer;
        border-radius: 7px;
        font-size: 0.82rem;
        transition: background 0.2s, color 0.2s;
        white-space: nowrap;
        overflow: hidden;
      }

      .sb-logout:hover {
        background: #e50000;
        color: #fff;
        border-color: #e50000;
      }

      /* ── Main content ── */
      .main-content {
        flex: 1;
        min-width: 0;
        overflow-y: auto;
      }

      /* ── Responsive ── */
      @media (max-width: 700px) {
        .sidebar {
          width: 56px;
          min-width: 56px;
        }
        .sb-brand,
        .sb-label,
        .sb-user,
        .sidebar .sb-logout span:not(.sb-icon),
        .sb-section {
          display: none;
        }
      }
    `,
    ],
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
        if (id === 2) return 'Operador';
        return 'Espectador';
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
    ];

    readonly visibleNav = computed(() => {
        const roleId = this.auth.currentUser()?.idRol ?? 0;
        return this.allNav.filter(item => {
            if (!item.requiredRoles) return true;
            return item.requiredRoles.includes(roleId);
        });
    });

    toggleSidebar(): void {
        this.collapsed.update(v => !v);
    }

    logout(): void {
        this.auth.logout();
    }
}