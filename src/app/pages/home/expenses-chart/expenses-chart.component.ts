import {Component, computed, inject, input, LOCALE_ID, OnDestroy, OnInit, signal, viewChild} from '@angular/core';
import {ChartConfiguration, ChartOptions, ScriptableLineSegmentContext} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import {formatNumber} from '@angular/common';
import {CurrentExpensesService} from '@common/services/expenses/current-expenses.service';
import {UserSettingsStore} from '@common/services';
import {toSignal} from '@angular/core/rxjs-interop';
import {DATE_UTILS} from '@common/utils/date.utils';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ChartView} from '@common/models';
import {ChartThemeService, chartScales, todayMarkerPlugin, withAlpha} from '@common/charts/chart-theme';
import {LegendKeyComponent, LegendKeyItem} from '@components/ui';

type DateFilter = 'whole' | 'till-today' | 'from-today';

/**
 * Forecast chart with two views over the same rows:
 * Balance: expected left vs actual left. Daily: daily diff, expected spent and actual spent.
 */
@Component({
  selector: 'app-expenses-chart',
  imports: [
    BaseChartDirective,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    LegendKeyComponent,
  ],
  templateUrl: './expenses-chart.component.html',
  styleUrl: './expenses-chart.component.scss',
  host: {
    '[class.compact]': 'compact()',
    '[class.expanded]': 'expanded()',
    '(document:keydown.escape)': 'expanded.set(false)',
  },
})
export class ExpensesChartComponent implements OnInit, OnDestroy {
  readonly currentExpensesService = inject(CurrentExpensesService);
  readonly userSettingsStore = inject(UserSettingsStore);
  readonly chartTheme = inject(ChartThemeService);
  private readonly locale = inject(LOCALE_ID);

  /** Phone layout: shorter chart, two x labels, no y axis. */
  readonly compact = input(false);

  /** Desktop: the chart covers the whole window. */
  readonly expanded = signal(false);
  readonly dateFilter = signal<DateFilter>('whole');
  readonly chartView = signal<ChartView>(this.userSettingsStore.getUserSettings().chartView ?? 'balance');
  readonly currentExpenses = toSignal(this.currentExpensesService.currentExpenses$);
  readonly plugins = [todayMarkerPlugin];

  readonly chart = viewChild(BaseChartDirective);

  private readonly expenses = computed(() => {
    let expenses = this.currentExpenses()?.expenses;

    if (this.dateFilter() === 'from-today') {
      expenses = expenses?.filter(e => !DATE_UTILS.isBefore(e.date, new Date()));
    } else if (this.dateFilter() === 'till-today') {
      expenses = expenses?.filter(e => !DATE_UTILS.isBefore(new Date(), e.date));
    }

    return expenses ?? [];
  });

  private readonly todayIndex = computed(() =>
    this.expenses().findIndex(e => e.dateFormatted === DATE_UTILS.format(new Date(), 'month-day'))
  );

  readonly legend = computed<LegendKeyItem[]>(() => this.chartView() === 'balance'
    ? [
      {label: 'Expected, by your plan', mark: 'line', tone: 'muted'},
      {label: 'Actual so far', mark: 'thick', tone: 'accent'},
      {label: 'Actual, if the rest goes to plan', mark: 'dashed', tone: 'accent'},
    ]
    : [
      {label: 'Daily diff (expected left − actual left)', mark: 'dashed', tone: 'ink'},
      {label: 'Expected spent', mark: 'bar', tone: 'muted'},
      {label: 'Actual spent, as planned', mark: 'bar', tone: 'ink'},
      {label: 'Actual spent, over plan', mark: 'bar', tone: 'warn'},
      {label: 'Actual spent, under plan', mark: 'bar', tone: 'accent'},
    ]);

  readonly chartData = computed<ChartConfiguration<'line' | 'bar'>['data']>(() => {
    const expenses = this.expenses();
    const colors = this.chartTheme.colors();
    const todayIndex = this.todayIndex();
    const labels = expenses.map(e => e.dateFormatted);

    if (this.chartView() === 'balance') {
      return {
        labels,
        datasets: [
          {
            type: 'line',
            label: 'Expected left',
            data: expenses.map(e => e.expectedAmountLeft),
            borderColor: colors.muted,
            backgroundColor: colors.muted,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            type: 'line',
            label: 'Actual left',
            data: expenses.map(e => e.actualAmountLeft),
            borderColor: colors.accent,
            backgroundColor: withAlpha(colors.accent, 0.08),
            fill: 'start',
            borderWidth: 3,
            pointRadius: ctx => ctx.dataIndex === todayIndex ? 6 : 0,
            pointHoverRadius: 6,
            pointBorderWidth: 3,
            pointBackgroundColor: colors.surface,
            pointBorderColor: colors.accent,
            segment: {
              borderDash: (ctx: ScriptableLineSegmentContext) =>
                todayIndex >= 0 && ctx.p0DataIndex >= todayIndex ? [7, 6] : undefined,
            },
          },
        ],
      };
    }

    const actualSpentColor = (idx: number) => {
      const row = expenses[idx];
      if (!row || row.actualExpenseAmount == row.expectedExpenseAmount) return withAlpha(colors.ink, 0.7);
      return row.actualExpenseAmount > row.expectedExpenseAmount ? colors.warn : colors.accent;
    };

    return {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Daily diff',
          data: expenses.map(e => e.expectedAmountLeft - e.actualAmountLeft),
          borderColor: colors.ink,
          backgroundColor: colors.ink,
          borderWidth: 2,
          borderDash: [4, 4],
          pointRadius: ctx => ctx.dataIndex === todayIndex ? 5 : 0,
          pointHoverRadius: 4,
        },
        {
          type: 'bar',
          label: 'Expected spent',
          data: expenses.map(e => e.expectedExpenseAmount),
          backgroundColor: withAlpha(colors.muted, 0.35),
          borderRadius: 3,
        },
        {
          type: 'bar',
          label: 'Actual spent',
          data: expenses.map(e => e.actualExpenseAmount),
          backgroundColor: ctx => actualSpentColor(ctx.dataIndex),
          borderRadius: 3,
        },
      ],
    };
  });

  readonly chartOptions = computed<ChartOptions<'line' | 'bar'>>(() => {
    const colors = this.chartTheme.colors();
    const expenses = this.expenses();
    const todayIndex = this.todayIndex();
    const format = (value: number) => formatNumber(value, this.locale, '1.2-2');

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {duration: 0},
      interaction: {mode: 'index', intersect: false},
      layout: {padding: {top: 36}},
      scales: chartScales(colors, {compact: this.compact()}),
      plugins: {
        legend: {display: false},
        tooltip: {
          backgroundColor: colors.ink,
          titleColor: colors.surface,
          bodyColor: colors.surface,
          titleFont: {family: colors.fontBody, weight: 600},
          bodyFont: {family: colors.fontMono},
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${format(ctx.parsed.y)}`,
          },
        },
        todayMarker: {index: todayIndex,  datasetIndex: 1, colors},
      },
    };
  });

  changeChartView(chartView: ChartView): void {
    this.userSettingsStore.saveUserSettings({chartView});
    this.chartView.set(chartView);
  }

  readonly onResize = (): void => {
    this.chart()?.chart?.resize();
  };

  ngOnInit(): void {
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
  }
}
