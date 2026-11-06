import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp } from '@ionic/angular/standalone';
import { GlobalConfirmComponent } from './components/global-confirm/global-confirm.component';
import { GlobalToastComponent } from './components/global-toast/global-toast.component';
import { I18nService } from './i18n/i18n.service';
@Component({selector:'app-root',standalone:true,templateUrl:'app.component.html',imports:[IonApp,RouterOutlet,GlobalToastComponent,GlobalConfirmComponent]})
export class AppComponent {
  private readonly i18n = inject(I18nService);
  constructor() { this.i18n.start(); }
}
