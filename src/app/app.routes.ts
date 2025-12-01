import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/open-home/open-home').then((m) => m.OpenHome),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./pages/open-projects/open-projects').then((m) => m.OpenProjects),
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./pages/open-tasks/open-tasks').then((m) => m.OpenTasks),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
