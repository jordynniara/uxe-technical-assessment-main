import {bootstrapApplication} from '@angular/platform-browser';
import '@atpco/atp-web';
import {appConfig} from './app/app.config';
import {App} from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
