import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'equipos', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'equipos',
    loadComponent: () => import('./pages/equipos/equipos.component').then(m => m.EquiposComponent)
  },
  {
    path: 'jugadores',
    loadComponent: () => import('./pages/jugadores/jugadores.component').then(m => m.JugadoresComponent)
  }
];
