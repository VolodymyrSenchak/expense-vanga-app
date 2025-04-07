import {ActualExpenseModel} from '@common/models/actual-expenses.model';

export interface CurrentExpensesModel {
  expenses: ExpenseForDay[];
}

export interface ExpenseForDay {
  date: string;
  dateFormatted: string;
  expectedExpenseAmount: number;
  actualExpenseAmount: number;
  expectedAmountLeft: number;
  actualAmountLeft: number;
  expectedDailyComment?: string;
  actualDailyComment?: string;
  isWeekend: boolean;
  actualExpense: ActualExpenseModel | undefined;
  isPreviousDay: boolean;
  isToday: boolean;
}
