export interface UserSettings {
  viewMode: DesktopViewMode;
  theme?: 'light' | 'dark';
  chartView?: ChartView;
}

export type DesktopViewMode = 'table' | 'calendar';

export type ChartView = 'balance' | 'daily';
