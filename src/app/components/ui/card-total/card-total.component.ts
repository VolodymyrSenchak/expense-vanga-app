import {Component, input} from '@angular/core';
import {AmountComponent} from '../amount/amount.component';

/** The total line that closes a card ("Per week  700.00"). */
@Component({
  selector: 'ev-card-total',
  imports: [AmountComponent],
  templateUrl: './card-total.component.html',
  styleUrl: './card-total.component.scss',
})
export class CardTotalComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly currency = input<string>();
}
