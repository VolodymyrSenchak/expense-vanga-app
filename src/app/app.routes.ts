import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home.page';
import { ExpectedExpensesPageComponent } from './pages/expected-expenses/expected-expenses.page';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'expected-expenses', component: ExpectedExpensesPageComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
