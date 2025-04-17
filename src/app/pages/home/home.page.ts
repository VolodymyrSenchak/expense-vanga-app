import { Component } from "@angular/core";
import { MatCardModule } from '@angular/material/card';
import {ExpensesListComponent} from './expences-list/expenses-list.component';
import {ExpensesChartComponent} from './expenses-chart/expenses-chart.component';

@Component({
  selector: 'app-home-page',
  imports: [
    ExpensesListComponent,
    MatCardModule,
    ExpensesChartComponent,
  ],
  styleUrl: './home.page.scss',
  templateUrl: './home.page.html',
})
export class HomePageComponent {
  //shareReplay({ bufferSize: 1, refCount: true })
}
