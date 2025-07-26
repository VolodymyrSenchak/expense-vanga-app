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

interface ExpensesChartConfig {}

@Component({
  selector: 'app-expenses-chart',
  imports: [
    BaseChartDirective,
    MatTableModule,
  ],
  templateUrl: './expenses-chart.component.html',
})
export class ExpensesChartComponent implements OnInit, OnDestroy {
  readonly currentExpensesService = inject(CurrentExpensesService);
  readonly expensesChartConfig = signal<ExpensesChartConfig>({});
  readonly currentExpenses = toSignal(this.currentExpensesService.currentExpenses$);

  readonly chart = viewChild(BaseChartDirective);

  readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    if (!this.currentExpenses()) {
      return { labels: [], datasets: [] };
    }

    const { expenses } = this.currentExpenses()!;
    const todayDateIndex = expenses.findIndex(
      e => e.dateFormatted === DATE_UTILS.format(new Date(), 'month-day')
    );

    return {
      labels: expenses.map(e => e.dateFormatted),
      datasets: [
        {
          label: 'Expected expenses',
          borderColor: '#213448',
          backgroundColor: '#213448',
          data: expenses.map(e => e.expectedAmountLeft),
          pointRadius: (ctx) => ctx.dataIndex === todayDateIndex ? 4 : 3,
          pointStyle: 'rectRounded',
        },
        {
          label: 'Actual expenses',
          borderColor: '#94B4C1',
          backgroundColor: '#94B4C1',
          data: expenses.map(e => e.actualAmountLeft),
          pointRadius: (ctx) => ctx.dataIndex === todayDateIndex ? 4 : 3,
          pointStyle: 'rectRounded'
        }
      ]
    };
  });

  readonly lineChartOptions: ChartOptions<'line'> = {
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
