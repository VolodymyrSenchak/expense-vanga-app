import {TestBed} from '@angular/core/testing';
import {firstValueFrom, of} from 'rxjs';
import {CurrentExpensesService} from './current-expenses.service';
import {ExpensesService} from './expenses.service';
import {CurrenciesService} from '@common/services/currencies';
import {ActualExpensesModel} from '@common/models/actual-expenses.model';
import {CurrenciesModel, getDefaultExpectedExpensesModel} from '@common/models';
import {ExpenseForDay} from '@common/models/current-expenses.model';

// Pins the numbers the UI shows. The redesign must not change any of them.
describe('CurrentExpensesService', () => {
  const actual: ActualExpensesModel = {
    expenses: [
      {date: '2026-10-03', amount: 50, isOverridingExpected: false, comment: 'Taxi'},
      {date: '2026-10-06', amount: 80, isOverridingExpected: true, comment: ''},
      {date: '2026-10-08', amount: -30, isOverridingExpected: false, comment: 'Refund'},
      {date: '2026-10-12', amount: 20, isOverridingExpected: false, comment: ''},
    ],
  };
  const currencies: CurrenciesModel = {currencies: [], defaultCurrency: 'USD'};

  let service: CurrentExpensesService;
  let expensesService: jasmine.SpyObj<ExpensesService>;

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 9, 12, 0, 0));

    expensesService = jasmine.createSpyObj<ExpensesService>('ExpensesService', [
      'getExpectedExpenses$', 'getActualExpenses$', 'addActualExpense$',
    ]);
    expensesService.getExpectedExpenses$.and.returnValue(of(getDefaultExpectedExpensesModel()));
    expensesService.getActualExpenses$.and.returnValue(of(actual));
    expensesService.addActualExpense$.and.returnValue(of(true));

    TestBed.configureTestingModule({
      providers: [
        {provide: ExpensesService, useValue: expensesService},
        {provide: CurrenciesService, useValue: {getCurrencies$: () => of(currencies)}},
      ],
    });
    service = TestBed.inject(CurrentExpensesService);
  });

  afterEach(() => jasmine.clock().uninstall());

  const rows = async () => (await firstValueFrom(service.currentExpenses$)).expenses;
  const row = (list: ExpenseForDay[], date: string) => list.find(r => r.date === date)!;
  const amounts = (r: ExpenseForDay) => [
    r.expectedExpenseAmount, r.actualExpenseAmount, r.expectedAmountLeft, r.actualAmountLeft,
  ];

  it('covers the salary cycle including both salary days', async () => {
    const list = await rows();
    expect(list.length).toBe(32);
    expect(list[0].date).toBe('2026-10-01');
    expect(list[31].date).toBe('2026-11-01');
    expect(list[0].dateFormatted).toBe('Oct 01');
    expect(list[0].dayOfWeekFormatted).toBe('Thursday');
  });

  it('computes expected and actual amounts per day', async () => {
    const list = await rows();
    expect(amounts(row(list, '2026-10-01'))).toEqual([100, 100, 6900, 6900]);
    expect(amounts(row(list, '2026-10-03'))).toEqual([100, 150, 6700, 6650]);
    expect(amounts(row(list, '2026-10-06'))).toEqual([100, 80, 6400, 6370]);
    expect(amounts(row(list, '2026-10-08'))).toEqual([100, 70, 6200, 6200]);
    expect(amounts(row(list, '2026-10-09'))).toEqual([100, 100, 6100, 6100]);
    expect(amounts(row(list, '2026-10-10'))).toEqual([300, 300, 5800, 5800]);
    expect(amounts(row(list, '2026-10-12'))).toEqual([100, 120, 5600, 5580]);
    expect(amounts(row(list, '2026-11-01'))).toEqual([100, 100, 3600, 3580]);
  });

  it('carries comments, weekly amount and flags', async () => {
    const list = await rows();
    const oct3 = row(list, '2026-10-03');
    const oct10 = row(list, '2026-10-10');
    expect(oct3.actualDailyComment).toBe('Taxi');
    expect(oct3.weeklyExpenseAmount).toBe(100);
    expect(oct10.expectedDailyComment).toBe('Some additional expense');
    expect(oct10.isWeekend).toBeTrue();
    expect(row(list, '2026-10-08').isPreviousDay).toBeTrue();
    expect(row(list, '2026-10-09').isToday).toBeTrue();
    expect(row(list, '2026-10-09').isPreviousDay).toBeFalse();
    expect(row(list, '2026-10-12').isWeekend).toBeFalse();
  });

  it('computes month analytics from the last day', async () => {
    const analytics = await firstValueFrom(service.monthAnalytics$);
    expect(analytics).toEqual({expectedAmountLeft: 3600, actualAmountLeft: 3580, diff: 20});
  });

  it('sums spending from the cycle start through today (D1)', async () => {
    // Oct 1-9: expected 9 x 100; actual 100+100+150+100+100+80+100+70+100.
    expect(await firstValueFrom(service.spentSoFar$)).toEqual({
      fromDate: '2026-10-01', expectedSpent: 900, actualSpent: 900, overPlan: 0,
    });
  });

  it('reports overspending since the cycle start (D1)', async () => {
    expensesService.getActualExpenses$.and.returnValue(of({expenses: [
      {date: '2026-10-02', amount: 250, isOverridingExpected: false, comment: ''},
      {date: '2026-10-20', amount: 999, isOverridingExpected: false, comment: 'future, not counted'},
    ]}));
    expect(await firstValueFrom(service.spentSoFar$)).toEqual({
      fromDate: '2026-10-01', expectedSpent: 900, actualSpent: 1150, overPlan: 250,
    });
  });

  it('derives today\'s actual expense from current balances', async () => {
    await firstValueFrom(service.actualizeActualExpenseForToday$({
      money: [{name: 'Card', amount: 5000, currency: 'USD'}, {name: 'Cash', amount: 1000, currency: 'USD'}],
    }));
    expect(expensesService.addActualExpense$).toHaveBeenCalledWith({
      amount: 100, date: '2026-10-09', isOverridingExpected: false, comment: '',
    });
  });
});
