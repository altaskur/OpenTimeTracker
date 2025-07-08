import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'examples',
    loadComponent: () =>
      import('./pages/examples/examples').then((m) => m.Examples),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
