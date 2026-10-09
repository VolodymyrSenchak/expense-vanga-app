import {Component, input} from '@angular/core';

export interface LegendKeyItem {
  label: string;
  /** line = 2 px, thick = 3 px, dashed = 3 px dashed, bar = filled block */
  mark: 'line' | 'thick' | 'dashed' | 'bar';
  tone: 'muted' | 'accent' | 'ink' | 'warn';
}

/** Chart key drawn with the same marks as the chart; replaces Chart.js's built-in legend. */
@Component({
  selector: 'ev-legend-key',
  templateUrl: './legend-key.component.html',
  styleUrl: './legend-key.component.scss',
})
export class LegendKeyComponent {
  readonly items = input.required<LegendKeyItem[]>();
}
