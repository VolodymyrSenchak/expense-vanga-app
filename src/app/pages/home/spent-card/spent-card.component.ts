import {Component, computed, input} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {SpentSoFarModel} from '@common/models';
import {DATE_UTILS} from '@common/utils/date.utils';
import {AmountComponent, AmountPairComponent} from '@components/ui';

/** Expected vs actual spending from the cycle start through today (CurrentExpensesService.spentSoFar$). */
@Component({
  selector: 'app-spent-card',
  imports: [
    MatCardModule,
    AmountComponent,
    AmountPairComponent,
  ],
  templateUrl: './spent-card.component.html',
  styleUrl: './spent-card.component.scss',
})
export class SpentCardComponent {
  readonly spentSoFar = input.required<SpentSoFarModel>();

  readonly fromLabel = computed(() => DATE_UTILS.format(this.spentSoFar().fromDate, 'short-month-day'));
  readonly absOverPlan = computed(() => Math.abs(this.spentSoFar().overPlan));
}
