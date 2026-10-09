import {Component, input} from '@angular/core';
import {MonthAnalyticsModel} from '@common/models';
import {DiffChipComponent, StatComponent} from '@components/ui';

/** Balance left at the end of the cycle: actual and expected side by side, plus the difference chip. */
@Component({
  selector: 'app-month-analytics',
  imports: [
    StatComponent,
    DiffChipComponent,
  ],
  templateUrl: './month-analytics.component.html',
  styleUrl: './month-analytics.component.scss'
})
export class MonthAnalyticsComponent {
  readonly monthAnalytics = input.required<MonthAnalyticsModel>();
  readonly currency = input<string>();
  /** Last day of the cycle, e.g. "Nov 1". */
  readonly endLabel = input<string>();
  /** Phone layout: smaller numbers, short labels. */
  readonly compact = input(false);
}
