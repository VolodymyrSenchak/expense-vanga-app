import {Component, inject, signal} from "@angular/core";
import { MatCardModule } from '@angular/material/card';
import {ExpensesListComponent} from './expences-list/expenses-list.component';
import {ExpensesChartComponent} from './expenses-chart/expenses-chart.component';
import { ExpensesInlineListComponent } from "./expenses-inline-list/expenses-inline-list.component";
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { UserSettingsStore} from "@common/services";
import {ExpensesCalendarComponent} from './expenses-calendar/expenses-calendar.component';
import {map} from 'rxjs';
import { MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActualizeExpensesButtonComponent} from './actualize-expenses-button/actualize-expenses-button.component';

@Component({
  selector: 'app-home-page',
  imports: [
    ExpensesListComponent,
    MatCardModule,
    ExpensesChartComponent,
    ExpensesInlineListComponent,
    MatButtonToggleModule,
    ExpensesCalendarComponent,
    MatIconModule,
    MatButtonModule,
    ActualizeExpensesButtonComponent
  ],
  styleUrl: './home.page.scss',
  templateUrl: './home.page.html',
})
export class HomePageComponent {
  readonly userSettingsStore = inject(UserSettingsStore);
  readonly breakpointObserver = inject(BreakpointObserver);
  readonly viewMode = signal<'table' | 'calendar'>(this.userSettingsStore.getUserSettings().viewMode);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.Handset]).pipe(map(result => result.matches))
  );

  changeViewMode(viewMode: 'table' | 'calendar'): void {
    this.userSettingsStore.saveUserSettings({ viewMode });
    this.viewMode.set(viewMode);
  }
}
