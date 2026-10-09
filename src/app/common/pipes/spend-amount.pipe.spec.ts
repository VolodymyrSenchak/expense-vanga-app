import {TestBed} from '@angular/core/testing';
import {SpendAmountPipe} from './spend-amount.pipe';

describe('SpendAmountPipe', () => {
  let pipe: SpendAmountPipe;

  beforeEach(() => {
    pipe = TestBed.runInInjectionContext(() => new SpendAmountPipe());
  });

  it('shows spending without a sign', () => {
    expect(pipe.transform(1234.5)).toBe('1,234.50');
  });

  it('keeps a plus for negative spending', () => {
    expect(pipe.transform(-50)).toBe('+50.00');
  });

  it('shows zero plainly', () => {
    expect(pipe.transform(0)).toBe('0.00');
    expect(pipe.transform(undefined)).toBe('0.00');
  });
});
