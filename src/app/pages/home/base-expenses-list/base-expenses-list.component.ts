import { firstValueFrom } from "rxjs";
import { ActualExpenseDialogComponent, ActualExpenseDialogParams } from "../actual-expense-dialog/actual-expense-dialog.component";
import { ExpenseForDay } from "@common/models/current-expenses.model";
import { inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CurrentExpensesService } from "@common/services";
import { toSignal } from "@angular/core/rxjs-interop";

export abstract class BaseExpensesListComponent {
  readonly currentExpensesService = inject(CurrentExpensesService);
  readonly dialog = inject(MatDialog);
  readonly currentExpenses = toSignal(this.currentExpensesService.currentExpenses$);

  async startEditing(expense: ExpenseForDay): Promise<boolean> {
    if (!expense) return false;

    const dialogRef = this.dialog.open(ActualExpenseDialogComponent, {
      data: <ActualExpenseDialogParams>{ expense }
    });

    const changed = await firstValueFrom(dialogRef.afterClosed()) as boolean;

    if (changed) {
      this.currentExpensesService.reloadExpenses();
    }

    return changed;
  }
}