import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./pages/projects/projects').then((m) => m.Projects),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
