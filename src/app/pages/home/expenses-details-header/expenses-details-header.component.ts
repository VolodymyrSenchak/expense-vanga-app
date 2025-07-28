import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { ActualizeExpensesButtonComponent } from "../actualize-expenses-button/actualize-expenses-button.component";
import { Component, input, output } from "@angular/core";
import { DesktopViewMode } from "@common/models";

@Component({
  selector: 'app-expenses-details-header',
  imports: [
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule,
    ActualizeExpensesButtonComponent
  ],
  templateUrl: './expenses-details-header.component.html',
})
export class ExpensesDetailsHeaderComponent {
  readonly viewMode = input<DesktopViewMode>();
  readonly viewModeChanged = output<DesktopViewMode>();

  changeViewMode(viewMode: DesktopViewMode): void {
    this.viewModeChanged.emit(viewMode);
  }
}