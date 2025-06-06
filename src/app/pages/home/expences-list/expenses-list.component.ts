import {Component, signal} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ExpenseForDay} from '@common/models/current-expenses.model';
import {LoadingComponent} from '../../../components/loading';
import { BaseExpensesListComponent } from '../base-expenses-list';

@Component({
  selector: 'app-expenses-list',
  imports: [
    MatTableModule,
    MatIconButton,
    MatIcon,
    LoadingComponent,
  ],
  templateUrl: './expenses-list.component.html',
  styleUrl: './expenses-list.component.scss'
})
export class ExpensesListComponent extends BaseExpensesListComponent {
  readonly skeleton = Array.from({length: 20}, () => ['100%', '24px']) as [string, string][];
  readonly columnsToDisplay: Array<keyof ExpenseForDay> = [
    'dateFormatted',
    'expectedAmountLeft',
    'expectedExpenseAmount',
    'actualAmountLeft',
    'actualExpenseAmount',
  ];

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
