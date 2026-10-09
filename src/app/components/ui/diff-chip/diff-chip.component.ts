import {Component, computed, input} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

/**
 * Expected minus actual at the end of the cycle (MonthAnalyticsModel.diff).
 * Positive: behind plan. Negative: ahead of plan. Zero: on plan.
 */
@Component({
  selector: 'ev-diff-chip',
  imports: [DecimalPipe, MatIconModule],
  templateUrl: './diff-chip.component.html',
  styleUrl: './diff-chip.component.scss',
  host: {
    '[class.behind]': 'diff() > 0',
  },
})
export class DiffChipComponent {
  readonly diff = input.required<number>();
  readonly currency = input<string>();

  readonly absDiff = computed(() => Math.abs(this.diff()));
}
