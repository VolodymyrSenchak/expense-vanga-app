import {Component, computed, input, output, signal} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {DecimalPipe} from '@angular/common';
import {ExpenseForDay} from '@common/models/current-expenses.model';
import {DesktopViewMode} from '@common/models';
import {DATE_UTILS} from '@common/utils/date.utils';
import {LoadingComponent} from '../../../components/loading';
import {AmountComponent} from '@components/ui';
import {BaseExpensesListComponent} from '../base-expenses-list';
import {ExpensesDetailsHeaderComponent} from '../expenses-details-header';

/** Today plus this many following days are shown before "Show more". */
const UPCOMING_DAYS_SHOWN = 12;

@Component({
  selector: 'app-expenses-list',
  imports: [
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    DecimalPipe,
    LoadingComponent,
    AmountComponent,
    ExpensesDetailsHeaderComponent,
  ],
  templateUrl: './expenses-list.component.html',
  styleUrl: './expenses-list.component.scss'
})
export class ExpensesListComponent extends BaseExpensesListComponent {
  readonly viewMode = input<DesktopViewMode>();
  readonly viewModeChanged = output<DesktopViewMode>();

  readonly skeleton = Array.from({length: 12}, () => ['100%', '48px']) as [string, string][];
  readonly groupColumns = ['groupDay', 'groupExpected', 'groupActual', 'groupRest'];
  readonly columns = ['day', 'expectedSpent', 'expectedLeft', 'actualSpent', 'actualLeft', 'note', 'action'];

  readonly showPrevious = signal(false);
  readonly expanded = signal(false);

  private readonly filteredRows = computed(() =>
    (this.currentExpenses()?.expenses ?? [])
      .filter(e => this.showPrevious() || !e.isPreviousDay)
  );

  readonly visibleRows = computed(() => {
    const rows = this.filteredRows();
    if (this.expanded()) return rows;
    const previous = rows.filter(e => e.isPreviousDay);
    const upcoming = rows.filter(e => !e.isPreviousDay).slice(0, UPCOMING_DAYS_SHOWN);
    return [...previous, ...upcoming];
  });

  readonly hiddenCount = computed(() => this.filteredRows().length - this.visibleRows().length);

  readonly lastDayLabel = computed(() => {
    const rows = this.filteredRows();
    return rows.length ? DATE_UTILS.format(rows[rows.length - 1].date, 'short-month-day') : '';
  });

  readonly affectedExpenseDate = signal<string>('');

  override async startEditing(expense: ExpenseForDay): Promise<boolean> {
    const changed = await super.startEditing(expense);
    if (changed) {
        this.affectedExpenseDate.set(expense.date);
        setTimeout(() => this.affectedExpenseDate.set(''), 1000);
    }
    return changed;
  }
}
