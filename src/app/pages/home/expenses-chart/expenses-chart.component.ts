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

    if (this.showFromToday()) {
      expenses = expenses?.filter(e => !DATE_UTILS.isBefore(e.date, new Date()));
    }

    if (!expenses) {
      return { labels: [], datasets: [] };
    }

    const todayDateIndex = expenses.findIndex(
      e => e.dateFormatted === DATE_UTILS.format(new Date(), 'month-day')
    );

    return {
      labels: expenses!.map(e => e.dateFormatted),
      datasets: [
        {
          type: 'line',
          label: 'Expected left',
          borderColor: '#213448',
          backgroundColor: '#213448',
          data: expenses.map(e => e.expectedAmountLeft),
          pointRadius: (ctx) => ctx.dataIndex === todayDateIndex ? 6 : 3,
          pointStyle: 'rectRounded',
        },
        {
          type: 'line',
          label: 'Actual left',
          borderColor: '#94B4C1',
          backgroundColor: '#94B4C1',
          data: expenses.map(e => e.actualAmountLeft),
          pointRadius: (ctx) => ctx.dataIndex === todayDateIndex ? 6 : 3,
          pointStyle: 'rectRounded'
        },
        {
          type: 'bar',
          label: 'Expected spent',
          data: expenses.map(e => e.expectedExpenseAmount),
          backgroundColor: '#66717B'
        },
        {
          type: 'bar',
          label: 'Actual spent',
          data: expenses.map(e => e.actualExpenseAmount),
          backgroundColor: '#A7BAC2',
        },
      ]
    };
  });

  readonly lineChartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    animation: {
      duration: 0
    }
  };

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
