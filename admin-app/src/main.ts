import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';


// Start the Ionic Angular application
bootstrapApplication(
  AppComponent,
  appConfig
).catch((error) => {
  console.error('Application startup error:', error);
});