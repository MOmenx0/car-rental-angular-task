import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'theme';
type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly darkSig = signal(false);
  readonly isDark = this.darkSig.asReadonly();

  init() {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? 'light';
    this.apply(saved);
  }

  toggle() {
    this.apply(this.darkSig() ? 'light' : 'dark');
  }

  private apply(mode: ThemeMode) {
    const isDark = mode === 'dark';
    this.darkSig.set(isDark);
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_KEY, mode);
  }
}

