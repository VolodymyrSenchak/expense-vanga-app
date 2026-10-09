import {SAVINGS_UTILS} from './savings.utils';
import {CurrenciesModel, SavingModel} from '@common/models';

describe('SAVINGS_UTILS', () => {
  const currencies: CurrenciesModel = {
    defaultCurrency: 'PLN',
    currencies: [{from: 'USD', to: 'PLN', rate: 4}, {from: 'PLN', to: 'EUR', rate: 0.25}],
  };
  const savings: SavingModel[] = [
    {id: '1', name: 'Card', currency: 'PLN', transactions: [
      {id: 'a', amount: 1000, date: '2026-01-01'}, {id: 'b', amount: -200, date: '2026-02-01'},
    ]},
    {id: '2', name: 'Dollars', currency: 'USD', transactions: [{id: 'c', amount: 100, date: '2026-03-01'}]},
    {id: '3', name: 'Hidden', currency: 'PLN', includeInTotals: false, transactions: [{id: 'd', amount: 5000, date: '2026-03-01'}]},
    {id: '4', name: 'Empty', currency: 'GBP'},
  ];

  it('sums transactions per saving', () => {
    expect(SAVINGS_UTILS.savingTotal(savings[0])).toBe(800);
    expect(SAVINGS_UTILS.savingTotal(savings[3])).toBe(0);
  });

  it('converts with direct, inverse and missing rates', () => {
    expect(SAVINGS_UTILS.convertAmount(100, 'USD', 'PLN', currencies)).toBe(400);
    expect(SAVINGS_UTILS.convertAmount(400, 'PLN', 'USD', currencies)).toBe(100);
    expect(SAVINGS_UTILS.convertAmount(100, 'GBP', 'PLN', currencies)).toBe(100);
    expect(SAVINGS_UTILS.convertAmount(100, 'USD', 'PLN', undefined)).toBe(100);
  });

  it('totals included savings in the target currency', () => {
    expect(SAVINGS_UTILS.calculateTotals(savings, currencies, 'PLN')).toBe(1200);
    expect(SAVINGS_UTILS.calculateTotals(savings, currencies, 'USD')).toBe(300);
    expect(SAVINGS_UTILS.calculateTotals(savings, currencies, 'EUR')).toBe(300);
  });
});
