import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSignal = signal(false);
  public darkMode = this.darkModeSignal.asReadonly();

  constructor() {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') {
      this.darkModeSignal.set(true);
      document.documentElement.classList.add('dark');
    }
  }

  toggle(): void {
    const newVal = !this.darkModeSignal();
    this.darkModeSignal.set(newVal);
    localStorage.setItem('darkMode', String(newVal));
    if (newVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}