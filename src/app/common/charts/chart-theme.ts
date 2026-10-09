import {computed, inject, Injectable} from '@angular/core';
import {ChartOptions, ChartType, Plugin} from 'chart.js';
import {ThemeService} from '@common/services/theme.service';

export interface ChartColors {
  ink: string;
  muted: string;
  line: string;
  accent: string;
  warn: string;
  surface: string;
  fontBody: string;
  fontMono: string;
}

const readToken = (style: CSSStyleDeclaration, name: string): string => style.getPropertyValue(name).trim();

/** Chart colors come from the --ev-* tokens and are re-read whenever the theme changes. */
@Injectable({providedIn: 'root'})
export class ChartThemeService {
  private readonly themeService = inject(ThemeService);

  readonly colors = computed<ChartColors>(() => {
    this.themeService.isDark();
    const style = getComputedStyle(document.body);
    return {
      ink: readToken(style, '--ev-ink'),
      muted: readToken(style, '--ev-muted'),
      line: readToken(style, '--ev-line'),
      accent: readToken(style, '--ev-accent'),
      warn: readToken(style, '--ev-warn'),
      surface: readToken(style, '--ev-surface'),
      fontBody: readToken(style, '--ev-font-body'),
      fontMono: readToken(style, '--ev-font-mono'),
    };
  });
}

/** `#RRGGBB` plus alpha as `rgba()`; other formats are returned unchanged. */
export const withAlpha = (color: string, alpha: number): string => {
  const hex = color.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return color;
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** Shared x/y axis look: token grid, mono ticks, unrotated labels, about five y ticks. */
export const chartScales = (
  colors: ChartColors,
  options: {compact?: boolean} = {},
): NonNullable<ChartOptions<'line' | 'bar'>['scales']> => {
  const ticksFont = {family: colors.fontMono, size: 12};
  return {
    x: {
      grid: {display: false},
      border: {color: colors.line},
      ticks: {
        color: colors.muted,
        font: ticksFont,
        maxRotation: 0,
        autoSkip: !options.compact,
        align: options.compact ? 'inner' : 'center',
        maxTicksLimit: 6,
        // Compact: only the first and last day. (Leave the key out otherwise, so Chart.js keeps its label callback.)
        ...(options.compact ? {
          callback: function (value, index, ticks) {
            return index === 0 || index === ticks.length - 1 ? this.getLabelForValue(Number(value)) : '';
          },
        } : {}),
      },
    },
    y: {
      display: !options.compact,
      grid: {color: colors.line},
      border: {display: false},
      ticks: {color: colors.muted, font: ticksFont, maxTicksLimit: 6},
    },
  };
};

export interface TodayMarkerOptions {
  /** Index of today in the chart's labels; -1 hides the marker. */
  index: number;
  /** Text of the label drawn above today's point; empty hides the label. */
  text?: string;
  /** Dataset whose point the label sits on. */
  datasetIndex?: number;
  colors: ChartColors;
}

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends ChartType> {
    todayMarker?: TodayMarkerOptions;
  }
}

/**
 * Dashed vertical rule at today, plus an optional dark label above today's point.
 * Pass options under `plugins.todayMarker`.
 */
export const todayMarkerPlugin: Plugin<ChartType, TodayMarkerOptions> = {
  id: 'todayMarker',
  beforeDatasetsDraw(chart, _args, options) {
    if (!options || options.index < 0) return;
    const x = chart.scales['x']?.getPixelForValue(options.index);
    if (x === undefined) return;
    const {top, bottom} = chart.chartArea;
    const ctx = chart.ctx;
    ctx.save();
    ctx.strokeStyle = options.colors.muted;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.restore();
  },
  afterDatasetsDraw(chart, _args, options) {
    if (!options || options.index < 0 || !options.text) return;
    const point = chart.getDatasetMeta(options.datasetIndex ?? 0).data[options.index];
    if (!point) return;
    const ctx = chart.ctx;
    ctx.save();
    ctx.font = `600 13px ${options.colors.fontBody}`;
    const paddingX = 10;
    const height = 26;
    const width = ctx.measureText(options.text).width + paddingX * 2;
    const {left, right, top} = chart.chartArea;
    const x = Math.min(Math.max(point.x + 12, left), right - width);
    const y = Math.max(point.y - height - 14, top);
    ctx.fillStyle = options.colors.ink;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 8);
    ctx.fill();
    ctx.fillStyle = options.colors.surface;
    ctx.textBaseline = 'middle';
    ctx.fillText(options.text, x + paddingX, y + height / 2);
    ctx.restore();
  },
};
