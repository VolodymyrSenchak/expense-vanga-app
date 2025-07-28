import {Component, inject, signal} from "@angular/core";
import { MatCardModule } from '@angular/material/card';
import {ExpensesListComponent} from './expences-list/expenses-list.component';
import {ExpensesChartComponent} from './expenses-chart/expenses-chart.component';
import { ExpensesInlineListComponent } from "./expenses-inline-list/expenses-inline-list.component";
import { UserSettingsStore} from "@common/services";
import {ExpensesCalendarComponent} from './expenses-calendar/expenses-calendar.component';
import {map} from 'rxjs';
import { MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import { DesktopViewMode } from "@common/models";

@Component({
  selector: 'app-home-page',
  imports: [
    ExpensesListComponent,
    MatCardModule,
    ExpensesChartComponent,
    ExpensesInlineListComponent,
    ExpensesCalendarComponent,
    MatIconModule,
    MatButtonModule,
  ],
  styleUrl: './home.page.scss',
  templateUrl: './home.page.html',
})
export class HomePageComponent {
  readonly userSettingsStore = inject(UserSettingsStore);
  readonly breakpointObserver = inject(BreakpointObserver);
  readonly viewMode = signal<DesktopViewMode>(this.userSettingsStore.getUserSettings().viewMode);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.Handset]).pipe(map(result => result.matches))
  );

  changeViewMode(viewMode: DesktopViewMode): void {
    this.userSettingsStore.saveUserSettings({ viewMode });
    this.viewMode.set(viewMode);
  }
}
