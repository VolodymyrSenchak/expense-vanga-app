import {Component, computed, signal} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {LoadingComponent} from '@components/loading';
import { BaseExpensesListComponent } from '../base-expenses-list';
import {ActualizeExpensesButtonComponent} from '../actualize-expenses-button/actualize-expenses-button.component';
import {DecimalPipe} from '@angular/common';
import {ExpenseSignPipe} from '@common/pipes';

@Component({
  selector: 'app-expenses-inline-list',
  templateUrl: './expenses-inline-list.component.html',
  styleUrls: ['./expenses-inline-list.component.scss'],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSlideToggle,
    LoadingComponent,
    ActualizeExpensesButtonComponent,
    DecimalPipe,
    ExpenseSignPipe
  ],
})
export class ExpensesInlineListComponent extends BaseExpensesListComponent {
  readonly skeleton = Array.from({length: 10}, () => ['100%', '64px']) as [string, string][];
  readonly showPrevious = signal(false);

  readonly currentExpensesPrepared = computed(() =>
    (this.currentExpenses()?.expenses ?? [])
      .filter(e => this.showPrevious() ? e : !e.isPreviousDay)
  );

  readonly monthAnalytics = computed(() => {
    const expenses = this.currentExpenses()?.expenses ?? [];
    const lastDayExpense = expenses[expenses.length - 1];
    const { expectedAmountLeft, actualAmountLeft } = lastDayExpense;
    return {
      expectedAmountLeft,
      actualAmountLeft,
      diff: expectedAmountLeft - actualAmountLeft,
    };
  });
}
