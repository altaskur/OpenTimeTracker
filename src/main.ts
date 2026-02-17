import 'zone.js';

import './styles.scss';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
