import {Component, computed, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {SavingModel, SavingTransactionModel} from '@common/models';
import {DATE_UTILS} from '@common/utils/date.utils';

export interface SavingTransactionDialogData {
  transaction?: SavingTransactionModel;
  savingId?: string;
  savings: SavingModel[];
}

export interface SavingTransactionDialogResult {
  savingId: string;
  amount: number;
  date: string;
  comment?: string;
}

@Component({
  selector: 'app-saving-transaction-dialog',
  templateUrl: 'saving-transaction-dialog.component.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
    MatDatepickerModule,
  ],
})
export class SavingTransactionDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SavingTransactionDialogComponent>);
  readonly data = inject<SavingTransactionDialogData>(MAT_DIALOG_DATA);

  readonly savingId = signal(this.data.savingId ?? this.data.savings[0]?.id ?? '');
  readonly amount = signal(this.data.transaction?.amount ?? 0);
  readonly date = signal<Date>(
    this.data.transaction?.date ? DATE_UTILS.parse(this.data.transaction.date) : new Date()
  );
  readonly comment = signal(this.data.transaction?.comment ?? '');

  readonly isEdit = !!this.data.transaction;
  readonly isValid = computed(() => !!this.savingId() && this.amount() !== 0);

  constructor() {
    console.log(this.data);
  }

  onCancel(): void {
    this.dialogRef.close(undefined);
  }

  onDelete(): void {
    this.dialogRef.close('delete');
  }

  onSave(): void {
    if (!this.isValid()) return;
    const result: SavingTransactionDialogResult = {
      savingId: this.savingId(),
      amount: this.amount(),
      date: DATE_UTILS.format(this.date(), 'date'),
      comment: this.comment() || undefined,
    };
    this.dialogRef.close(result);
  }
}
