import {Component, input} from '@angular/core';
import {DecimalPipe} from '@angular/common';

/** A labelled headline number. `size` picks the type ramp; `kind` the expected/actual styling. */
@Component({
  selector: 'ev-stat',
  imports: [DecimalPipe],
  templateUrl: './stat.component.html',
  styleUrl: './stat.component.scss',
  host: {
    '[class.expected]': "kind() === 'expected'",
    '[class.plain]': "kind() === 'plain'",
  },
})
export class StatComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly currency = input<string>();
  readonly kind = input<'expected' | 'actual' | 'plain'>('plain');
  readonly size = input<'hero' | 'hero-2' | 'large' | 'compact'>('large');
}
