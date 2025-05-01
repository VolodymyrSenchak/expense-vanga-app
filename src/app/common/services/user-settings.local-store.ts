import {Injectable} from '@angular/core';
import {UserSettings} from '@common/models/user-settings.model';

@Injectable({ providedIn: "root" })
export class UserSettingsStore {
  private readonly userSettingsKey = 'user-settings';

  getUserSettings(): UserSettings {
    const settings = localStorage.getItem(this.userSettingsKey);
    return settings ? JSON.parse(settings) : {
      viewMode: 'table'
    };
  }

  saveUserSettings(settings: Partial<UserSettings>): void {
    const existing = this.getUserSettings();
    const toSave = { ...existing, ...settings };
    localStorage.setItem(this.userSettingsKey, JSON.stringify(toSave));
  }
}
