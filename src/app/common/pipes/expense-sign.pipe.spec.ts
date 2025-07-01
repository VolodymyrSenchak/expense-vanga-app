import { ExpenseSignPipe } from './expense-sign.pipe';

describe('ExpenseSignPipe', () => {
  it('create an instance', () => {
    const pipe = new ExpenseSignPipe();
    expect(pipe).toBeTruthy();
  });
});
