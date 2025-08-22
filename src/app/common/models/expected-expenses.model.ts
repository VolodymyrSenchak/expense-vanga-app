export interface ExpectedExpensesModel {
  name: string;
  earnings: { name: string; amount: number; currency: string }[];
  salaryDayOfMonth: number;
  mainEarning?: number;
  weeklyExpenseCoefficient: number;
  weeklyExpenses: WeeklyExpense[];
  dailyExpenses: DailyExpense[];
}

export const getDefaultExpectedExpensesModel = (): ExpectedExpensesModel => {
  return {
    name : 'Default',
    earnings: [
      { name: 'Main Salary', amount: 5000, currency: 'PLN' },
      { name: 'Side Job', amount: 2000, currency: 'PLN' }
    ],
    weeklyExpenseCoefficient: 1,
    salaryDayOfMonth: 1,
    dailyExpenses: [
      { dayOfMonth: 10, amount: 200, comment: 'Some additional expense' }
    ],
    weeklyExpenses: [
      { dayOfWeek: DayOfWeek.Monday, amount: 100 },
      { dayOfWeek: DayOfWeek.Tuesday, amount: 100 },
      { dayOfWeek: DayOfWeek.Wednesday, amount: 100 },
      { dayOfWeek: DayOfWeek.Thursday, amount: 100 },
      { dayOfWeek: DayOfWeek.Friday, amount: 100 },
      { dayOfWeek: DayOfWeek.Saturday, amount: 100 },
      { dayOfWeek: DayOfWeek.Sunday, amount: 100 },
    ],
  }
}

export interface Expense {
  amount: number;
}

export interface DailyExpense extends Expense {
  dayOfMonth: number;
  comment: string;
}

export interface WeeklyExpense extends Expense {
  dayOfWeek: DayOfWeek;
}

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6
}
