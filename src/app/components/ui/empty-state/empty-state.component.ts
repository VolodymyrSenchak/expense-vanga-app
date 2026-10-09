import {Component, input} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

/** Icon, title and projected explanation for a card with nothing in it yet. */
@Component({
  selector: 'ev-empty-state',
  imports: [MatIconModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input.required<string>();
}
