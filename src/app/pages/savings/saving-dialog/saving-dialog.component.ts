import {Component, computed, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {SavingModel} from '@common/models';

export interface SavingDialogData {
  saving?: SavingModel;
}

export interface SavingDialogResult {
  name: string;
  currency: string;
}

@Component({
  selector: 'app-saving-dialog',
  templateUrl: 'saving-dialog.component.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
})
export class SavingDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SavingDialogComponent>);
  readonly data = inject<SavingDialogData>(MAT_DIALOG_DATA);

  name = signal(this.data.saving?.name ?? '');
  currency = signal(this.data.saving?.currency ?? '');

  readonly isEdit = computed(() => !!this.data.saving);
  readonly isValid = computed(
    () => this.name().trim().length > 0 && this.currency().trim().length > 0,
  );

  onCancel(): void {
    this.dialogRef.close(undefined);
  }

  onDelete(): void {
    this.dialogRef.close('delete');
  }

  onSave(): void {
    if (!this.isValid()) return;
    const result: SavingDialogResult = {
      name: this.name().trim(),
      currency: this.currency().trim().toUpperCase(),
    };
    this.dialogRef.close(result);
  }
}
