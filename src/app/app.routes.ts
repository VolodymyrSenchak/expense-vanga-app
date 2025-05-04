import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home.page';
import { ExpectedExpensesPageComponent } from './pages/expected-expenses/expected-expenses.page';
import {SavingsPageComponent} from './pages/savings/savings.page';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'expected-expenses', component: ExpectedExpensesPageComponent },
  { path: 'savings', component: SavingsPageComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
