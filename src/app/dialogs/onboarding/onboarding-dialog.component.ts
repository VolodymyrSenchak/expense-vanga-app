import {afterNextRender, Component, computed, ElementRef, inject, Injector, OnInit, signal} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {firstValueFrom} from 'rxjs';
import {AuthStore, CurrentExpensesService, ExpensesService, UserSettingsStore} from '@common/services';
import {CurrenciesService} from '@common/services/currencies';
import {DayOfWeek, ExpectedExpensesModel, isDefaultExpectedExpensesModel} from '@common/models';
import {DATE_UTILS} from '@common/utils/date.utils';
import {CurrencyAutocompleteComponent} from '@components/ui';

type OnboardingStep = 'welcome' | 'income' | 'spending' | 'balance' | 'routine';

const TOUR_STEPS: OnboardingStep[] = ['welcome', 'routine'];
const SETUP_STEPS: OnboardingStep[] = ['welcome', 'income', 'spending', 'balance', 'routine'];

/**
 * First-visit guide. Always explains how the app works; while the plan is still the sample one
 * it also collects the user's own income, usual spending and current balance.
 */
@Component({
  selector: 'app-onboarding-dialog',
  templateUrl: './onboarding-dialog.component.html',
  styleUrl: './onboarding-dialog.component.scss',
  // Every step submits the one shared form; without this, later steps would open already marked invalid.
  providers: [{provide: ErrorStateMatcher, useValue: {isErrorState: (control) => !!control?.invalid && control.touched} as ErrorStateMatcher}],
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    CurrencyAutocompleteComponent,
  ],
})
export class OnboardingDialogComponent implements OnInit {
  private readonly expensesService = inject(ExpensesService);
  private readonly currentExpensesService = inject(CurrentExpensesService);
  private readonly currenciesService = inject(CurrenciesService);
  private readonly settingsStore = inject(UserSettingsStore);
  private readonly authStore = inject(AuthStore);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly dialogRef = inject(MatDialogRef<OnboardingDialogComponent>);

  readonly isReady = signal(false);
  readonly isSetup = signal(false);
  readonly isSaving = signal(false);
  readonly isSaved = signal(false);
  readonly isLoggedIn = !!this.authStore.getSession()?.access_token;
  readonly forecast = signal<{ amount: number; currency: string; date: string } | null>(null);

  readonly steps = computed(() => this.isSetup() ? SETUP_STEPS : TOUR_STEPS);
  readonly stepIndex = signal(0);
  readonly step = computed(() => this.steps()[this.stepIndex()]);
  readonly isLastStep = computed(() => this.stepIndex() === this.steps().length - 1);

  readonly form = this.formBuilder.group({
    income: this.formBuilder.group({
      salaryDayOfMonth: [1 as number | null, [Validators.required, Validators.min(1), Validators.max(31)]],
      amount: [null as number | null, [Validators.required, Validators.min(1)]],
      currency: ['', [Validators.required]],
    }),
    spending: this.formBuilder.group({
      weekday: [null as number | null, [Validators.required, Validators.min(0)]],
      weekend: [null as number | null, [Validators.required, Validators.min(0)]],
      bills: this.formBuilder.array<UntypedFormGroup>([]),
    }),
    balance: this.formBuilder.group({
      amount: [null as number | null, [Validators.min(0)]],
    }),
  });

  private readonly formValue = toSignal(this.form.valueChanges, {initialValue: this.form.value});

  readonly currency = computed(() => (this.formValue().income?.currency ?? '').trim().toUpperCase());
  readonly income = computed(() => Number(this.formValue().income?.amount) || 0);

  /** Rough spending for a 30-day month: usual days plus the fixed bills. */
  readonly monthlySpending = computed(() => {
    const spending = this.formValue().spending;
    const perWeek = (Number(spending?.weekday) || 0) * 5 + (Number(spending?.weekend) || 0) * 2;
    const bills = ((spending?.bills ?? []) as { amount: number }[])
      .reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);
    return Math.round(perWeek * 30 / 7 + bills);
  });

  readonly canContinue = computed(() => {
    this.formValue();
    switch (this.step()) {
      case 'income': return this.form.controls.income.valid;
      case 'spending': return this.form.controls.spending.valid;
      case 'balance': return this.form.controls.balance.valid;
      default: return true;
    }
  });

  constructor() {
    this.dialogRef.afterClosed().subscribe(() => this.settingsStore.saveUserSettings({onboardingDone: true}));
  }

  async ngOnInit(): Promise<void> {
    const [plan, currencies] = await Promise.all([
      firstValueFrom(this.expensesService.getExpectedExpenses$()),
      firstValueFrom(this.currenciesService.getCurrencies$()),
    ]);

    this.form.controls.income.patchValue({currency: currencies.defaultCurrency});
    this.isSetup.set(isDefaultExpectedExpensesModel(plan));
    // Setup holds typed answers, so a stray backdrop click must not throw them away.
    this.dialogRef.disableClose = this.isSetup();
    this.isReady.set(true);
  }

  addBill(): void {
    this.form.controls.spending.controls.bills.push(this.formBuilder.group({
      comment: [''],
      amount: [null, [Validators.required, Validators.min(0)]],
      dayOfMonth: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
    }));
  }

  removeBill(index: number): void {
    this.form.controls.spending.controls.bills.removeAt(index);
  }

  async next(): Promise<void> {
    if (!this.canContinue() || this.isSaving()) return;

    if (this.isLastStep()) {
      this.close();
    } else if (this.step() === 'balance') {
      await this.savePlan();
      this.goTo(this.stepIndex() + 1);
    } else {
      this.goTo(this.stepIndex() + 1);
    }
  }

  back(): void {
    this.goTo(this.stepIndex() - 1);
  }

  close(): void {
    this.dialogRef.close(this.isSaved());
    if (this.isSaved()) {
      this.router.navigateByUrl('/');
    }
  }

  private goTo(index: number): void {
    this.stepIndex.set(index);
    afterNextRender(() => this.focusStep(), {injector: this.injector});
  }

  /** The control that had focus is gone after a step change, so move focus into the new step. */
  private focusStep(): void {
    const host = this.host.nativeElement;
    (host.querySelector<HTMLElement>('input') ?? host.querySelector<HTMLElement>('button[type=submit]'))?.focus();
  }

  private async savePlan(): Promise<void> {
    this.isSaving.set(true);
    try {
      const {income, spending, balance} = this.form.getRawValue();
      const currency = this.currency();
      const weekend = [DayOfWeek.Saturday, DayOfWeek.Sunday];
      const weekDays = [
        DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday,
        DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday,
      ];

      const plan: ExpectedExpensesModel = {
        name: 'Default',
        earnings: [{name: 'Salary', amount: income.amount ?? 0, currency}],
        salaryDayOfMonth: income.salaryDayOfMonth ?? 1,
        weeklyExpenseCoefficient: 1,
        weeklyExpenses: weekDays.map(dayOfWeek => ({
          dayOfWeek,
          amount: (weekend.includes(dayOfWeek) ? spending.weekend : spending.weekday) ?? 0,
        })),
        dailyExpenses: (spending.bills as { comment: string; amount: number; dayOfMonth: number }[])
          .map(bill => ({dayOfMonth: bill.dayOfMonth, amount: bill.amount, comment: bill.comment}))
          .sort((a, b) => a.dayOfMonth - b.dayOfMonth),
      };

      const currencies = await firstValueFrom(this.currenciesService.getCurrencies$());
      await firstValueFrom(this.currenciesService.saveCurrencies$({...currencies, defaultCurrency: currency}));
      await firstValueFrom(this.expensesService.saveExpectedExpenses$(plan));

      if (balance.amount !== null) {
        const money = {money: [{name: 'Main account', amount: balance.amount, currency}]};
        await firstValueFrom(this.expensesService.saveCurrentMoneyAmount$(money));
        await firstValueFrom(this.currentExpensesService.actualizeActualExpenseForToday$(money));
      }

      this.currentExpensesService.reloadExpenses();
      const {expenses} = await firstValueFrom(this.currentExpensesService.currentExpenses$);
      const lastDay = expenses[expenses.length - 1];
      this.forecast.set({
        amount: lastDay.actualAmountLeft,
        currency,
        date: DATE_UTILS.format(lastDay.date, 'short-month-day'),
      });
      this.isSaved.set(true);
    } finally {
      this.isSaving.set(false);
    }
  }
}
