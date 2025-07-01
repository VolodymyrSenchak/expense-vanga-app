import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'expenseSign'
})
export class ExpenseSignPipe implements PipeTransform {

  transform(value: string | number): string {
    const num = Number(value);
    if (isNaN(num)) return '';
    if (num > 0) return `-${num}`;
    if (num < 0) return `+${Math.abs(num)}`;
    return '0';
  }

}
