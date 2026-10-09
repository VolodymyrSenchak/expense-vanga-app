import {Component, computed, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatRipple} from '@angular/material/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {LoadingComponent} from '@components/loading';
import {AmountComponent} from '@components/ui';
import {DATE_UTILS} from '@common/utils/date.utils';
import {getCycleInfo} from '@common/utils/cycle.utils';
import {ExpenseForDay} from '@common/models/current-expenses.model';
import {BaseExpensesListComponent} from '../base-expenses-list';
import {MonthAnalyticsComponent} from '../month-analytics/month-analytics.component';
import {ExpensesChartComponent} from '../expenses-chart/expenses-chart.component';
import {TodayCardComponent} from '../today-card/today-card.component';

/** Phone layout of the forecast: headline pair, chart, today, then the days as a list. */
@Component({
  selector: 'app-expenses-inline-list',
  templateUrl: './expenses-inline-list.component.html',
  styleUrls: ['./expenses-inline-list.component.scss'],
  imports: [
    MatButtonModule,
    MatCardModule,
    MatRipple,
    LoadingComponent,
    AmountComponent,
    MonthAnalyticsComponent,
    ExpensesChartComponent,
    TodayCardComponent,
  ],
})
export class ExpensesInlineListComponent extends BaseExpensesListComponent {
  readonly skeleton = Array.from({length: 6}, () => ['100%', '64px']) as [string, string][];
  readonly monthAnalytics = toSignal(this.currentExpensesService.monthAnalytics$, {
    initialValue: {
      diff: 0,
      expectedAmountLeft: 0,
      actualAmountLeft: 0
    }
  });
  readonly currency = toSignal(this.currentExpensesService.defaultCurrency$);
  readonly showPrevious = signal(false);

  readonly today = computed(() => this.currentExpenses()?.expenses.find(e => e.isToday));
  readonly cycle = computed(() => getCycleInfo(this.currentExpenses()?.expenses ?? []));

  readonly currentExpensesPrepared = computed(() =>
    (this.currentExpenses()?.expenses ?? [])
      .filter(e => this.showPrevious() ? e : !e.isPreviousDay)
  );

  dayLabel(expense: ExpenseForDay): string {
    const label = DATE_UTILS.format(expense.date, 'weekday-month-day');
    return expense.isToday ? `Today · ${label}` : label;
  }
}
