import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'equipos', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'equipos', loadComponent: () => import('./pages/equipos/equipos.component').then(m => m.EquiposComponent) },
  { path: 'jugadores', loadComponent: () => import('./pages/jugadores/jugadores.component').then(m => m.JugadoresComponent) },
  { path: 'estadios', loadComponent: () => import('./pages/estadios/estadios.component').then(m => m.EstadiosComponent) },
  { path: 'grupos', loadComponent: () => import('./pages/grupos/grupos.component').then(m => m.GruposComponent) },
  { path: 'partidos', loadComponent: () => import('./pages/partidos/partidos.component').then(m => m.PartidosComponent) },
  { path: 'parametros', loadComponent: () => import('./pages/parametros/parametros.component').then(m => m.ParametrosComponent) },
  { path: 'roles', loadComponent: () => import('./pages/roles/roles.component').then(m => m.RolesComponent) },
  { path: 'usuarios', loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent) },
  { path: 'reportes', loadComponent: () => import('./pages/reportes/reportes.component').then(m => m.ReportesComponent) },
];