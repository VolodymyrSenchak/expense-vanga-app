export interface UserSettings {
  viewMode: DesktopViewMode;
  theme?: 'light' | 'dark';
  chartView?: ChartView;
  onboardingDone?: boolean;
}

export type DesktopViewMode = 'table' | 'calendar';

export type ChartView = 'balance' | 'daily';
