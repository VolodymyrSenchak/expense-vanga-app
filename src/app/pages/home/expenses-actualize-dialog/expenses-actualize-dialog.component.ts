import {Component, inject, OnInit} from '@angular/core';
import {CurrentExpensesService, ExpensesService, LoadingService} from '@common/services';
import { MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import {FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators} from '@angular/forms';
import {CurrentMoneyAmountModel } from '@common/models';
import {LoadingComponent} from '@components/loading';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-expenses-actualize-dialog',
  imports: [
    FormsModule,
    LoadingComponent,
    MatButtonModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogTitle,
    MatIcon,
  ],
  templateUrl: './expenses-actualize-dialog.component.html',
  styleUrl: './expenses-actualize-dialog.component.scss'
})
export class ExpensesActualizeDialogComponent implements OnInit {
  readonly expensesService = inject(ExpensesService);
  readonly currentExpensesService = inject(CurrentExpensesService);
  readonly formBuilder = inject(FormBuilder);
  readonly loadingSrv = new LoadingService();
  readonly dialogRef = inject(MatDialogRef<ExpensesActualizeDialogComponent>);

  readonly form = this.formBuilder.group({
    money: this.formBuilder.array<UntypedFormGroup>([]),
  });

  async ngOnInit(): Promise<void> {
    const currentMoney = await this.loadingSrv.waitObservable(this.expensesService.getCurrentMoneyAmount$());
    this.form.controls.money.clear();
    (currentMoney.money || []).forEach(c => this.addMoneyPart(c.name, c.amount, c.currency));
  }

  addMoneyPart(name: string = '', amount: number = 0, currency: string = ''): void {
    this.form.controls.money.push(this.formBuilder.group({
      from: [name, [Validators.required]],
      amount: [amount, [Validators.required, Validators.min(0)]],
      currency: [currency, [Validators.required]]
    }) as any);
  }

  removeMoneyPart(index: number): void {
    this.form.controls.money.removeAt(index);
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      const model = this.form.value as CurrentMoneyAmountModel;
      await this.loadingSrv.waitObservable(
        this.expensesService.saveCurrentMoneyAmount$(model),
        "Saving..."
      );
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
