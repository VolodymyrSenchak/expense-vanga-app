import {CurrenciesModel, SavingModel} from '@common/models';

export const SAVINGS_UTILS = {
  savingTotal: (saving: SavingModel): number =>
    (saving.transactions ?? []).reduce((sum, t) => sum + t.amount, 0),

  convertAmount: (amount: number, from: string, to: string, currencies: CurrenciesModel | undefined): number => {
    if (from === to || !currencies) return amount;
    const pair = currencies.currencies.find(c =>
      (c.from === from && c.to === to) || (c.from === to && c.to === from)
    );
    if (!pair) return amount;
    const rate = pair.from === from ? pair.rate : 1 / pair.rate;
    return amount * rate;
  },

  calculateTotals: (savings: SavingModel[], currencies: CurrenciesModel | undefined, targetCurrency: string): number =>
    savings
      .filter(saving => saving.includeInTotals !== false)
      .reduce((total, saving) => (
        total + SAVINGS_UTILS.convertAmount(SAVINGS_UTILS.savingTotal(saving), saving.currency, targetCurrency, currencies)
      ), 0),
};
