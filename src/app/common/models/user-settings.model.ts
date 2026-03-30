export interface UserSettings {
  viewMode: DesktopViewMode;
  theme?: 'light' | 'dark';
}

export type DesktopViewMode = 'table' | 'calendar';