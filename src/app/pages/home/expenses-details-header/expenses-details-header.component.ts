import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { Component, input, output } from "@angular/core";
import { DesktopViewMode } from "@common/models";

/** Header of the day-by-day card: title, projected filters, Table/Calendar switch. */
@Component({
  selector: 'app-expenses-details-header',
  imports: [
    MatButtonToggleModule,
  ],
  templateUrl: './expenses-details-header.component.html',
  styleUrl: './expenses-details-header.component.scss',
})
export class ExpensesDetailsHeaderComponent {
  readonly viewMode = input<DesktopViewMode>();
  readonly viewModeChanged = output<DesktopViewMode>();

  changeViewMode(viewMode: DesktopViewMode): void {
    this.viewModeChanged.emit(viewMode);
  }
}
