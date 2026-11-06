import { Component, inject } from '@angular/core';

import { I18nService, Lang } from './i18n.service';

/** Compact SW / EN dropdown, kept visible on both mobile and desktop. */
@Component({
    selector: 'app-language-switcher',
    standalone: true,
    template: `
        <select
            class="lang-select"
            aria-label="Language"
            title="Language"
            [value]="i18n.lang()"
            (change)="change($event)">
            <option value="sw" [selected]="i18n.lang() === 'sw'">SW</option>
            <option value="en" [selected]="i18n.lang() === 'en'">EN</option>
        </select>
    `,
    styles: [`
        :host { display: inline-flex; align-items: center; flex-shrink: 0; }
        :host(.floating) { position: fixed; top: 10px; right: 10px; z-index: 1000; }
        .lang-select {
            font: inherit;
            font-size: 12px;
            font-weight: 600;
            min-height: 32px;
            min-width: 52px;
            padding: 4px 6px;
            border-radius: 8px;
            border: 1px solid rgba(128, 128, 128, 0.4);
            background: #fff;
            color: #1f2937;
            cursor: pointer;
        }
    `]
})
export class LanguageSwitcherComponent {
    readonly i18n = inject(I18nService);

    change(event: Event): void {
        this.i18n.setLang((event.target as HTMLSelectElement).value as Lang);
    }
}

