import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

export type SupportedLang = 'en' | 'ar';

const STORAGE_KEY = 'lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private translate = inject(TranslateService);
  private document = inject(DOCUMENT);

  async init() {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');

    const lang: SupportedLang = this.getLangFromUrl() ?? this.getSavedLang() ?? 'en';
    await this.setLanguage(lang);
  }

  get currentLang(): SupportedLang {
    const lang = this.translate.currentLang as SupportedLang | undefined;
    return lang === 'ar' ? 'ar' : 'en';
  }

  async setLanguage(lang: SupportedLang) {
    await firstValueFrom(this.translate.use(lang));
    this.saveLang(lang);
    this.applyDocumentAttrs(lang);
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  private getSavedLang(): SupportedLang | null {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === 'ar' || v === 'en' ? v : null;
    } catch {
      return null;
    }
  }

  private getLangFromUrl(): SupportedLang | null {
    try {
      const url = new URL(window.location.href);
      const v = url.searchParams.get('lang');
      return v === 'ar' || v === 'en' ? v : null;
    } catch {
      return null;
    }
  }

  private saveLang(lang: SupportedLang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }

  private applyDocumentAttrs(lang: SupportedLang) {
    const html = this.document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}

