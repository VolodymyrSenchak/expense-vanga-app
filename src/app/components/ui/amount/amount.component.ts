import {Component, input} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {SpendAmountPipe} from '@common/pipes';

export type AmountKind = 'expected' | 'actual';

/** A money amount in the mono face. Expected values are muted, actual values are ink. */
@Component({
  selector: 'ev-amount',
  imports: [DecimalPipe, SpendAmountPipe],
  templateUrl: './amount.component.html',
  styleUrl: './amount.component.scss',
  host: {
    'class': 'ev-num',
    '[class.expected]': "kind() === 'expected'",
    '[class.strong]': 'strong()',
  },
})
export class AmountComponent {
  readonly value = input.required<number | null | undefined>();
  readonly kind = input<AmountKind>('actual');
  /** 'balance' formats as is; 'spend' drops the minus and marks refunds with "+". */
  readonly format = input<'balance' | 'spend'>('balance');
  readonly currency = input<string>();
  readonly strong = input(false);
}
