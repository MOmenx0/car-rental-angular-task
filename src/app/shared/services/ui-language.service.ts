import { Injectable, signal } from '@angular/core';

export type UiLanguage = 'en' | 'ar';

const STORAGE_KEY = 'ui_lang';

@Injectable({ providedIn: 'root' })
export class UiLanguageService {
  private readonly langSig = signal<UiLanguage>('en');
  readonly language = this.langSig.asReadonly();

  init() {
    const saved = (localStorage.getItem(STORAGE_KEY) as UiLanguage | null) ?? 'en';
    this.setLanguage(saved);
  }

  setLanguage(lang: UiLanguage) {
    this.langSig.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);

    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }
}

