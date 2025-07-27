import {Component, input} from '@angular/core';
import {MonthAnalyticsModel} from '@common/models';
import {DecimalPipe} from '@angular/common';
import {ExpenseSignPipe} from '@common/pipes';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-month-analytics',
  imports: [
    DecimalPipe,
    ExpenseSignPipe,
    MatIconModule
  ],
  templateUrl: './month-analytics.component.html',
  styleUrl: './month-analytics.component.scss'
})
export class MonthAnalyticsComponent {
  readonly monthAnalytics = input.required<MonthAnalyticsModel>();
}
