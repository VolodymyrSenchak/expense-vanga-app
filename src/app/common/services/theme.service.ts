import {Injectable, inject, signal} from '@angular/core';
import {UserSettingsStore} from './user-settings.local-store';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly settingsStore = inject(UserSettingsStore);
  readonly isDark = signal(false);

  constructor() {
    this.setDark(this.settingsStore.getUserSettings().theme === 'dark');
  }

  toggle() {
    this.setDark(!this.isDark());
  }

  private setDark(dark: boolean) {
    this.isDark.set(dark);
    document.body.classList.toggle('dark-theme', dark);
    this.settingsStore.saveUserSettings({ theme: dark ? 'dark' : 'light' });
  }
}
