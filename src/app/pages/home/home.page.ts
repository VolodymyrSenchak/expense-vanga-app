import {Component, inject, signal} from "@angular/core";
import { MatCardModule } from '@angular/material/card';
import {ExpensesListComponent} from './expences-list/expenses-list.component';
import {ExpensesChartComponent} from './expenses-chart/expenses-chart.component';
import { ExpensesInlineListComponent } from "./expenses-inline-list/expenses-inline-list.component";
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { UserSettingsStore } from "@common/services";
import {ExpensesCalendarComponent} from './expenses-calendar/expenses-calendar.component';

@Component({
  selector: 'app-home-page',
  imports: [
    ExpensesListComponent,
    MatCardModule,
    ExpensesChartComponent,
    ExpensesInlineListComponent,
    MatButtonToggleModule,
    ExpensesCalendarComponent,
  ],
  styleUrl: './home.page.scss',
  templateUrl: './home.page.html',
})
export class HomePageComponent {
  readonly userSettingsStore = inject(UserSettingsStore);
  readonly viewMode = signal<'table' | 'list' | 'calendar'>(this.userSettingsStore.getUserSettings().viewMode);

  changeViewMode(viewMode: 'table' | 'list' | 'calendar'): void {
    this.userSettingsStore.saveUserSettings({ viewMode });
    this.viewMode.set(viewMode);
  }
}
