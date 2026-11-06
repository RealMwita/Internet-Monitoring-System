import { Injectable, signal } from '@angular/core';

import { PATTERNS, SW } from './translations';

export type Lang = 'sw' | 'en';

const STORAGE_KEY = 'app_language';
const DEFAULT_LANG: Lang = 'sw';
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE']);

// Normalise text so dictionary keys match regardless of whitespace, quotes or case.
function norm(text: string): string {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/\.{3}/g, '\u2026')
        .trim()
        .toLowerCase();
}

const DICTIONARY = new Map<string, string>(
    Object.entries(SW).map(([en, sw]) => [norm(en), sw])
);

interface Tracked {
    original: string;
    applied: string;
}

/**
 * Language state plus a lightweight DOM translator.
 *
 * Templates and components keep their original English strings; every text node
 * and common accessibility attribute is translated on the fly into Swahili when
 * that language is active. Original text is remembered so switching back to
 * English restores it exactly.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
    readonly lang = signal<Lang>(this.readStored());

    private readonly textState = new WeakMap<Node, Tracked>();
    private readonly attrState = new WeakMap<Element, Record<string, Tracked>>();
    private observer?: MutationObserver;

    setLang(lang: Lang): void {
        if (lang !== 'sw' && lang !== 'en') return;
        this.lang.set(lang);
        try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* storage unavailable */ }
        document.documentElement.lang = lang;
        this.applyTree(document.documentElement);
    }

    /** Translate a string imperatively (e.g. for TS-built messages). */
    t(text: string): string {
        return this.lang() === 'sw' ? this.translate(text) : text;
    }

    start(): void {
        if (this.observer || typeof document === 'undefined') return;
        document.documentElement.lang = this.lang();
        this.applyTree(document.documentElement);
        this.observer = new MutationObserver((records) => {
            for (const record of records) {
                if (record.type === 'characterData') {
                    this.applyText(record.target);
                } else if (record.type === 'attributes') {
                    this.applyAttr(record.target as Element, record.attributeName!);
                } else {
                    record.addedNodes.forEach((node) => this.applyTree(node));
                }
            }
        });
        this.observer.observe(document.documentElement, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: ATTRS
        });
    }

    translate(text: string): string {
        const core = text.replace(/\s+/g, ' ').trim();
        if (!core) return text;
        const lead = text.match(/^\s*/)![0];
        const trail = text.match(/\s*$/)![0];
        const out = this.lookup(core);
        return out === null ? text : lead + out + trail;
    }

    private lookup(core: string): string | null {
        const key = norm(core);
        let hit = DICTIONARY.get(key);
        if (hit === undefined) {
            for (const [pattern, build] of PATTERNS) {
                const match = core.match(pattern);
                if (match) {
                    hit = build(match, (part) => this.translate(part).trim());
                    break;
                }
            }
        }
        if (hit === undefined) return null;
        const letters = core.replace(/[^A-Za-z]/g, '');
        if (letters.length > 1 && core === core.toUpperCase()) return hit.toUpperCase();
        if (/^[a-z]/.test(core)) return hit.charAt(0).toLowerCase() + hit.slice(1);
        return hit;
    }

    private applyTree(root: Node): void {
        if (root.nodeType === Node.TEXT_NODE) {
            this.applyText(root);
            return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        let node: Node | null = root;
        while (node) {
            if (node.nodeType === Node.TEXT_NODE) {
                this.applyText(node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as Element;
                for (const attr of ATTRS) if (el.hasAttribute(attr)) this.applyAttr(el, attr);
            }
            node = walker.nextNode();
        }
    }

    private skip(node: Node): boolean {
        const parent = node.parentElement;
        return !!parent && (SKIP_TAGS.has(parent.tagName) || !!parent.closest('[translate="no"]'));
    }

    private applyText(node: Node): void {
        if (node.nodeType !== Node.TEXT_NODE || this.skip(node)) return;
        const current = node.nodeValue ?? '';
        const state = this.textState.get(node);
        const original = state && state.applied === current ? state.original : current;
        const target = this.lang() === 'sw' ? this.translate(original) : original;
        if (target !== current) node.nodeValue = target;
        this.textState.set(node, { original, applied: target });
    }

    private applyAttr(el: Element, attr: string): void {
        const current = el.getAttribute(attr);
        if (current === null) return;
        const states = this.attrState.get(el) ?? {};
        const state = states[attr];
        const original = state && state.applied === current ? state.original : current;
        const target = this.lang() === 'sw' ? this.translate(original) : original;
        if (target !== current) el.setAttribute(attr, target);
        states[attr] = { original, applied: target };
        this.attrState.set(el, states);
    }

    private readStored(): Lang {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === 'sw' || stored === 'en') return stored;
        } catch { /* storage unavailable */ }
        return DEFAULT_LANG;
    }
}
