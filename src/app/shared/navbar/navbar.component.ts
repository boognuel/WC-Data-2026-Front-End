import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <span class="brand">⚽ Mundial 2026</span>
      <div class="links">
        <a routerLink="/equipos" routerLinkActive="active">Equipos</a>
        <a routerLink="/jugadores" routerLinkActive="active">Jugadores</a>
        <a routerLink="/estadios" routerLinkActive="active">Estadios</a>
        <a routerLink="/grupos" routerLinkActive="active">Grupos</a>
        <a routerLink="/partidos" routerLinkActive="active">Partidos</a>
        <a routerLink="/parametros" routerLinkActive="active">Parámetros</a>
        <a routerLink="/roles" routerLinkActive="active">Roles</a>
        <a routerLink="/usuarios" routerLinkActive="active">Usuarios</a>
        <a routerLink="/auditoria" routerLinkActive="active">Auditoría</a>
        <a routerLink="/reportes" routerLinkActive="active">Reportes</a>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #111111;
      padding: 12px 24px;
      border-bottom: 2px solid #FF4800;
      flex-wrap: wrap;
    }
    .brand {
      font-weight: bold;
      font-size: 1.1rem;
      color: #FF4800;
      margin-right: 16px;
    }
    .links {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    a {
      color: #DDDDDD;
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      transition: background 0.2s;
    }
    a:hover { background: #1a0800; }
    a.active { background: #FF4800; color: #fff; font-weight: bold; }
  `]
})
export class NavbarComponent {}