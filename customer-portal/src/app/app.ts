// Import Angular component utilities
import {
    Component,
    inject
} from '@angular/core';


// Import router utilities
import {
    RouterLink,
    RouterLinkActive,
    RouterOutlet
} from '@angular/router';


// Import tenant/company service
import {
    TenantService
} from './services/tenant.service';


// Import API helper for uploaded company files
import {
    getPublicFileUrl
} from './config/api.config';


// Import language support
import {
    I18nService
} from './i18n/i18n.service';

import {
    LanguageSwitcherComponent
} from './i18n/language-switcher.component';


@Component({
    selector: 'app-root',

    standalone: true,

    imports: [
        LanguageSwitcherComponent,
        RouterOutlet,
        RouterLink,
        RouterLinkActive
    ],

    templateUrl: './app.html',

    styleUrl: './app.css'
})
export class App {

    // Current company/tenant state
    readonly tenantService =
        inject(TenantService);


    // Convert company logo paths into browser-safe URLs
    readonly getPublicFileUrl =
        getPublicFileUrl;


    // Language state; the DOM translator keeps the whole portal in the selected language
    private readonly i18n =
        inject(I18nService);

    constructor() {
        this.i18n.start();
    }
}