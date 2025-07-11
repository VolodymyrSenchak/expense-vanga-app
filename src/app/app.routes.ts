import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home.page';
import { ExpectedExpensesPageComponent } from './pages/expected-expenses/expected-expenses.page';
import {SavingsPageComponent} from './pages/savings/savings.page';
import {PasswordRecoveryHandlerPage} from './pages/auth/password-recovery-handler';
import {CurrenciesPageComponent} from './pages/currencies/currencies.page';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'expected-expenses', component: ExpectedExpensesPageComponent },
  { path: 'auth/reset-password', component: PasswordRecoveryHandlerPage },
  { path: 'savings', component: SavingsPageComponent },
  { path: 'currencies', component: CurrenciesPageComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
