import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'cambiar-contrasena',
    loadComponent: () =>
      import('./pages/cambiar-contrasena/cambiar-contrasena.component').then(m => m.CambiarContrasenaComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: 'equipos', loadComponent: () => import('./pages/equipos/equipos.component').then(m => m.EquiposComponent) },
      { path: 'jugadores', loadComponent: () => import('./pages/jugadores/jugadores.component').then(m => m.JugadoresComponent) },
      { path: 'estadios', loadComponent: () => import('./pages/estadios/estadios.component').then(m => m.EstadiosComponent) },
      { path: 'grupos', loadComponent: () => import('./pages/grupos/grupos.component').then(m => m.GruposComponent) },
      { path: 'partidos', loadComponent: () => import('./pages/partidos/partidos.component').then(m => m.PartidosComponent) },
      { path: 'reportes', loadComponent: () => import('./pages/reportes/reportes.component').then(m => m.ReportesComponent) },
      { path: 'parametros', canActivate: [roleGuard], data: { roles: [1] }, loadComponent: () => import('./pages/parametros/parametros.component').then(m => m.ParametrosComponent) },
      { path: 'roles', canActivate: [roleGuard], data: { roles: [1] }, loadComponent: () => import('./pages/roles/roles.component').then(m => m.RolesComponent) },
      { path: 'usuarios', canActivate: [roleGuard], data: { roles: [1] }, loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];