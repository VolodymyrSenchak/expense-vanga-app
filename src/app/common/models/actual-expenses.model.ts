export interface ActualExpensesModel {
  expenses: ActualExpenseModel[];
}

export interface ActualExpenseModel {
  date: string;
  amount: number;
  isOverridingExpected: boolean;
  comment: string;
}

export const getDefaultActualExpensesModel = (): ActualExpensesModel => {
  return { expenses: [] };
}
