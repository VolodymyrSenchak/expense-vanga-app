import {Component, computed, inject, signal} from "@angular/core";
import {MatCardModule} from '@angular/material/card';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {CurrentExpensesService, UserSettingsStore} from "@common/services";
import {DesktopViewMode} from "@common/models";
import {DATE_UTILS} from '@common/utils/date.utils';
import {getCycleInfo} from '@common/utils/cycle.utils';
import {PageHeaderComponent} from '@components/ui';
import {ExpensesListComponent} from './expences-list/expenses-list.component';
import {ExpensesChartComponent} from './expenses-chart/expenses-chart.component';
import {ExpensesInlineListComponent} from "./expenses-inline-list/expenses-inline-list.component";
import {ExpensesCalendarComponent} from './expenses-calendar/expenses-calendar.component';
import {MonthAnalyticsComponent} from './month-analytics/month-analytics.component';
import {TodayCardComponent} from './today-card/today-card.component';
import {SpentCardComponent} from './spent-card/spent-card.component';
import {ActualizeExpensesButtonComponent} from './actualize-expenses-button/actualize-expenses-button.component';

@Component({
  selector: 'app-home-page',
  imports: [
    MatCardModule,
    PageHeaderComponent,
    ExpensesListComponent,
    ExpensesChartComponent,
    ExpensesInlineListComponent,
    ExpensesCalendarComponent,
    MonthAnalyticsComponent,
    TodayCardComponent,
    SpentCardComponent,
    ActualizeExpensesButtonComponent,
  ],
  styleUrl: './home.page.scss',
  templateUrl: './home.page.html',
})
export class HomePageComponent {
  readonly userSettingsStore = inject(UserSettingsStore);
  readonly breakpointObserver = inject(BreakpointObserver);
  readonly currentExpensesService = inject(CurrentExpensesService);
  readonly viewMode = signal<DesktopViewMode>(this.userSettingsStore.getUserSettings().viewMode);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.Handset]).pipe(map(result => result.matches))
  );

  readonly currentExpenses = toSignal(this.currentExpensesService.currentExpenses$);
  readonly currency = toSignal(this.currentExpensesService.defaultCurrency$);
  readonly monthAnalytics = toSignal(this.currentExpensesService.monthAnalytics$, {
    initialValue: {diff: 0, expectedAmountLeft: 0, actualAmountLeft: 0}
  });
  readonly spentSoFar = toSignal(this.currentExpensesService.spentSoFar$, {
    initialValue: {fromDate: '', expectedSpent: 0, actualSpent: 0, overPlan: 0}
  });

  readonly today = computed(() => this.currentExpenses()?.expenses.find(e => e.isToday));
  readonly cycle = computed(() => getCycleInfo(this.currentExpenses()?.expenses ?? []));
  readonly title = computed(() => this.cycle() ? `${this.cycle()!.monthName} forecast` : 'Forecast');
  readonly subtitle = computed(() => {
    const today = DATE_UTILS.format(new Date(), 'long-weekday-month-day');
    const cycle = this.cycle();
    return cycle ? `${today} · this cycle runs ${cycle.start} to ${cycle.end}` : today;
  });

  changeViewMode(viewMode: DesktopViewMode): void {
    this.userSettingsStore.saveUserSettings({ viewMode });
    this.viewMode.set(viewMode);
  }
}
