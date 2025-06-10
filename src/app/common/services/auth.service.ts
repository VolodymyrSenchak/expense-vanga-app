import { HttpClient } from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {Observable, tap} from 'rxjs';
import {AuthCommand, PasswordResetCommand, User} from '@common/models/auth';
import {AuthResult, PasswordResetResult} from '@common/models/auth/auth-result.model';
import {AuthRegisterCommand} from '@common/models/auth/auth-register-command.model';
import {AuthStore} from '@common/services/auth.local-store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authStore = inject(AuthStore);

  login(command: AuthCommand): Observable<AuthResult> {
    return this.http.post<AuthResult>(`auth/login`, command).pipe(
      tap(res => this.persistAuthResult(res))
    );
  }

  register(command: AuthRegisterCommand): Observable<AuthResult> {
    return this.http.post<AuthResult>(`auth/register`, command).pipe(
      tap(res => this.persistAuthResult(res))
    );
  }

  refreshToken(refreshToken: string): Observable<AuthResult> {
    return this.http.post<AuthResult>(`auth/refreshToken`, {refreshToken}).pipe(
      tap(res => this.persistAuthResult(res))
    );
  }

  getUserDetails(): Observable<User> {
    return this.http.get<User>(`auth/userDetails`);
  }

  resetPassword(command: PasswordResetCommand): Observable<PasswordResetResult> {
    return this.http.post<PasswordResetResult>(`auth/resetPassword`, command);
  }

  private persistAuthResult(authResult: AuthResult): void {
    this.authStore.setUser(authResult.user);
    this.authStore.setSession(authResult.session);
  }
}
