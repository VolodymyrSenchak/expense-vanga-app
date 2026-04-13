import { Component, computed, inject, input, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  month: number;
  isEditable: boolean;
  isWeekend: boolean;
  weekdayShort: string;
  isFirstOfMonth: boolean;
  monthLabel: string;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'app-daily-expenses-calendar',
  imports: [
    ReactiveFormsModule,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './daily-expenses-calendar.component.html',
  styleUrl: './daily-expenses-calendar.component.scss',
})
export class DailyExpensesCalendarComponent {
  private readonly fb = inject(FormBuilder);

  readonly salaryDayOfMonth = input<number>(1);
  readonly dailyExpenses = input.required<FormArray>();

  readonly weekdays = WEEKDAY_LABELS;
  readonly calendarDays = computed(() => this.buildCalendarDays(this.salaryDayOfMonth()));

  readonly addingToDayIndex = signal<number | null>(null);
  readonly addForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0)]],
    comment: [''],
  });

  private weekdayIndex(date: Date): number {
    const d = date.getDay();
    return d === 0 ? 6 : d - 1; // Mon=0 … Sun=6
  }

  private prevMonday(date: Date): Date {
    const idx = this.weekdayIndex(date);
    const r = new Date(date);
    r.setDate(date.getDate() - idx);
    return r;
  }

  private nextSunday(date: Date): Date {
    const idx = this.weekdayIndex(date);
    if (idx === 6) return new Date(date);
    const r = new Date(date);
    r.setDate(date.getDate() + (6 - idx));
    return r;
  }

  private buildCalendarDays(salaryDay: number): CalendarDay[] {
    if (!salaryDay || salaryDay < 1 || salaryDay > 31) return [];

    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();

    const salaryThis = new Date(y, m, salaryDay);
    const salaryNext = new Date(y, m + 1, salaryDay);

    const start = this.prevMonday(salaryThis);
    const end = this.nextSunday(salaryNext);

    const days: CalendarDay[] = [];
    const cur = new Date(start);

    while (cur <= end) {
      const date = new Date(cur);
      const dom = date.getDate();
      const mo = date.getMonth();
      const wi = this.weekdayIndex(date);

      days.push({
        date,
        dayOfMonth: dom,
        month: mo,
        isEditable: date >= salaryThis && date < salaryNext,
        isWeekend: wi >= 5,
        weekdayShort: WEEKDAY_LABELS[wi],
        isFirstOfMonth: dom === 1,
        monthLabel: MONTH_LABELS[mo],
      });

      cur.setDate(cur.getDate() + 1);
    }

    return days;
  }

  getExpensesForDay(day: CalendarDay): { index: number; group: FormGroup }[] {
    if (!day.isEditable) return [];

    const fa = this.dailyExpenses();
    const salaryDay = this.salaryDayOfMonth();
    const today = new Date();
    const currentMonth = today.getMonth();
    const nextMonth = (currentMonth + 1) % 12;

    const result: { index: number; group: FormGroup }[] = [];

    for (let i = 0; i < fa.length; i++) {
      const group = fa.at(i) as FormGroup;
      const dom = group.get('dayOfMonth')?.value as number;

      if (dom !== day.dayOfMonth) continue;

      const inCurrentMonth = day.month === currentMonth && dom >= salaryDay;
      const inNextMonth = day.month === nextMonth && dom < salaryDay;

      if (inCurrentMonth || inNextMonth) {
        result.push({ index: i, group });
      }
    }

    return result;
  }

  openAddForm(dayIndex: number): void {
    this.addingToDayIndex.set(dayIndex);
    this.addForm.reset({ amount: null, comment: '' });
  }

  closeAddForm(): void {
    this.addingToDayIndex.set(null);
  }

  confirmAdd(day: CalendarDay): void {
    if (this.addForm.valid) {
      const { amount, comment } = this.addForm.value;
      this.dailyExpenses().push(this.fb.group({
        dayOfMonth: [day.dayOfMonth, [Validators.required, Validators.min(1), Validators.max(31)]],
        amount: [amount, [Validators.required]],
        comment: [comment ?? ''],
      }) as any);
      this.closeAddForm();
    }
  }

  removeExpense(index: number): void {
    this.dailyExpenses().removeAt(index);
  }

  onDrop(event: CdkDragDrop<CalendarDay>, targetDay: CalendarDay): void {
    if (!targetDay.isEditable) return;
    const expenseIndex = event.item.data as number;
    const group = this.dailyExpenses().at(expenseIndex) as FormGroup;
    group.patchValue({ dayOfMonth: targetDay.dayOfMonth });
  }
}
