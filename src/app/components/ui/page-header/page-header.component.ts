import {Component, input} from '@angular/core';

/** Page title, optional subtitle, and projected actions on the right. */
@Component({
  selector: 'ev-page-header',
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
