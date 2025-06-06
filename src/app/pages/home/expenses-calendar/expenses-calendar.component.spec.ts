import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesCalendarComponent } from './expenses-calendar.component';

describe('ExpensesCalendarComponent', () => {
  let component: ExpensesCalendarComponent;
  let fixture: ComponentFixture<ExpensesCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
