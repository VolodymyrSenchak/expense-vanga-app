import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {ChartConfiguration, ChartOptions} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import {CurrentExpensesService} from '@common/services/expenses/current-expenses.service';
import {ThemeService} from '@common/services/theme.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {DATE_UTILS} from '@common/utils/date.utils';
import {MonthAnalyticsComponent} from '../month-analytics/month-analytics.component';
import {MatCheckbox} from '@angular/material/checkbox';

interface ExpensesChartConfig {}

@Component({
  selector: 'app-expenses-chart',
  imports: [
    BaseChartDirective,
    MatTableModule,
    MonthAnalyticsComponent,
    MatCheckbox,
  ],
  templateUrl: './expenses-chart.component.html',
})
export class ExpensesChartComponent implements OnInit, OnDestroy {
  readonly currentExpensesService = inject(CurrentExpensesService);
  readonly themeService = inject(ThemeService);
  readonly expensesChartConfig = signal<ExpensesChartConfig>({});
  readonly showFromToday = signal(false);
  readonly currentExpenses = toSignal(this.currentExpensesService.currentExpenses$);
  readonly monthAnalytics = toSignal(this.currentExpensesService.monthAnalytics$, {
    initialValue: {
      diff: 0, expectedAmountLeft: 0, actualAmountLeft: 0
    }
  });

  readonly chart = viewChild(BaseChartDirective);

  readonly chartData = computed<ChartConfiguration<'line' | 'bar'>['data']>(() => {
    let expenses = this.currentExpenses()?.expenses;
    const dark = this.themeService.isDark();

    if (this.showFromToday()) {
      expenses = expenses?.filter(e => !DATE_UTILS.isBefore(e.date, new Date()));
    }

    if (!expenses) {
      return { labels: [], datasets: [] };
    }

    const todayDateIndex = expenses.findIndex(
      e => e.dateFormatted === DATE_UTILS.format(new Date(), 'month-day')
    );

    const colors = {
      expectedLeft:  dark ? '#5a6e5a' : '#213448',
      actualLeft:    dark ? '#94B4C1' : '#94B4C1',
      expectedSpent: dark ? '#5a6e5a' : '#66717B',
      neutral:       dark ? '#94B4C1' : '#94B4C1',
      over:          dark ? '#ef5350' : '#E57373',
      under:         dark ? '#66bb6a' : '#81C784',
    };

    const getRow = (idx: number) => expenses[idx];

    return {
      labels: expenses!.map(e => e.dateFormatted),
      datasets: [
        {
          type: 'line',
          label: 'Expected left',
          borderColor: colors.expectedLeft,
          backgroundColor: colors.expectedLeft,
          data: expenses.map(e => e.expectedAmountLeft),
          pointRadius: (ctx) => ctx.dataIndex === todayDateIndex ? 6 : 3,
        },
        {
          type: 'line',
          label: 'Actual left',
          borderColor: colors.actualLeft,
          backgroundColor: colors.actualLeft,
          data: expenses.map(e => e.actualAmountLeft),
          pointRadius: (ctx) => ctx.dataIndex === todayDateIndex ? 6 : 3,
        },
        {
          type: 'bar',
          label: 'Expected spent',
          data: expenses.map(e => e.expectedExpenseAmount),
          backgroundColor: colors.expectedSpent,
        },
        {
          type: 'bar',
          label: 'Actual spent',
          data: expenses.map(e => e.actualExpenseAmount),
          backgroundColor: (ctx) => {
            const row = getRow(ctx.dataIndex);
            if (row.actualExpenseAmount == row.expectedExpenseAmount) return colors.neutral;
            if (row.actualExpenseAmount > row.expectedExpenseAmount) return colors.over;
            if (row.actualExpenseAmount < row.expectedExpenseAmount) return colors.under;
            return colors.neutral;
          },
        },
      ]
    };
  });

  readonly lineChartOptions = computed<ChartOptions<'line' | 'bar'>>(() => {
    const gridColor = this.themeService.isDark() ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
    const tickColor = this.themeService.isDark() ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
    return {
      responsive: true,
      animation: { duration: 0 },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: tickColor } },
        y: { grid: { color: gridColor }, ticks: { color: tickColor } },
      },
    };
  });

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
