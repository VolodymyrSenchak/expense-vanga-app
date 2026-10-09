import {Component, computed, input} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {ExpenseForDay} from '@common/models/current-expenses.model';
import {DATE_UTILS} from '@common/utils/date.utils';
import {AmountComponent, AmountPairComponent} from '@components/ui';
import {ActualizeExpensesButtonComponent} from '../actualize-expenses-button/actualize-expenses-button.component';

/** Today's planned spend and what is left after today, from today's row. */
@Component({
  selector: 'app-today-card',
  imports: [
    MatCardModule,
    AmountComponent,
    AmountPairComponent,
    ActualizeExpensesButtonComponent,
  ],
  templateUrl: './today-card.component.html',
  styleUrl: './today-card.component.scss',
})
export class TodayCardComponent {
  readonly today = input.required<ExpenseForDay>();
  /** Shows the "Update balances" action (phone layout). */
  readonly showAction = input(false);

  readonly dateLabel = computed(() => DATE_UTILS.format(this.today().date, 'weekday-month-day'));
}
