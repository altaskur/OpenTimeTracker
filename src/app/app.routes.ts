import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Projects } from './pages/projects/projects';
import { Reports } from './pages/reports/reports';
import { Config } from './pages/config/config';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
  },
  {
    path: 'projects',
    component: Projects,
  },
  {
    path: 'reports',
    component: Reports,
  },
  {
    path: 'config',
    component: Config,
  },
];
