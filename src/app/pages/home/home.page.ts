import {Component, inject, signal} from "@angular/core";
import { MatCardModule } from '@angular/material/card';
import {ExpensesListComponent} from './expences-list/expenses-list.component';
import {ExpensesChartComponent} from './expenses-chart/expenses-chart.component';
import { ExpensesInlineListComponent } from "./expenses-inline-list/expenses-inline-list.component";
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { UserSettingsStore} from "@common/services";
import {ExpensesCalendarComponent} from './expenses-calendar/expenses-calendar.component';
import {firstValueFrom} from 'rxjs';
import { MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {ExpensesActualizeDialogComponent} from './expenses-actualize-dialog';

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
    MatButtonModule
  ],
  styleUrl: './home.page.scss',
  templateUrl: './home.page.html',
})
export class HomePageComponent {
  readonly userSettingsStore = inject(UserSettingsStore);
  readonly dialog = inject(MatDialog);
  readonly viewMode = signal<'table' | 'list' | 'calendar'>(this.userSettingsStore.getUserSettings().viewMode);

  changeViewMode(viewMode: 'table' | 'list' | 'calendar'): void {
    this.userSettingsStore.saveUserSettings({ viewMode });
    this.viewMode.set(viewMode);
  }

  async refreshExpenses(): Promise<void> {
    const dialogRef = this.dialog.open(ExpensesActualizeDialogComponent);
    await firstValueFrom(dialogRef.afterClosed());
  }
}
