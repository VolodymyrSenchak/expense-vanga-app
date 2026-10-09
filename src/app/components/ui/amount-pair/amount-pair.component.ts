import {Component, input} from '@angular/core';
import {AmountComponent} from '../amount/amount.component';

/** Expected and actual of the same value, one row each, styled per the expected/actual pair rule. */
@Component({
  selector: 'ev-amount-pair',
  imports: [AmountComponent],
  templateUrl: './amount-pair.component.html',
  styleUrl: './amount-pair.component.scss',
})
export class AmountPairComponent {
  readonly expected = input.required<number>();
  readonly actual = input.required<number>();
  readonly format = input<'balance' | 'spend'>('balance');
  readonly expectedLabel = input('Expected');
  readonly actualLabel = input('Actual');
}
