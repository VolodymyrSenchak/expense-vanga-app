import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService, AuthStore, DialogManager} from '@common/services';
import {catchError, Observable, switchMap, throwError} from 'rxjs';
import {AuthResult} from '@common/models/auth/auth-result.model';

const PUBLIC_AUTH_ENDPOINTS = ['auth/login', 'auth/google', 'auth/register', 'auth/refreshToken', 'auth/resetPassword'];

export const HttpAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);
  const dialogManager = inject(DialogManager);
  const session = authStore.getSession();

  if (PUBLIC_AUTH_ENDPOINTS.some(endpoint => req.url.endsWith(endpoint))) {
    return next(req);
  }

  const refreshTokenMethod = (
    request: HttpRequest<any>,
    next: HttpHandlerFn,
  ): Observable<HttpEvent<any>> => {
    return authService.refreshToken(session?.refresh_token!).pipe(
      switchMap((res: AuthResult) => {
        authStore.setUser(res.user);
        authStore.setSession(res.session);
        request = request.clone({
          setHeaders: { Authorization: 'Bearer ' + res.session.access_token },
        });
        return next(request);
      })
    );
  }

  if (session) {
    try {
      req = req.clone({
        setHeaders: { Authorization: 'Bearer ' + session.access_token },
      });
    } catch (exception) {}
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error?.status == 403 || error?.status == 401) {
        return refreshTokenMethod(req, next);
      } else {
        authStore.clearAuth();
        dialogManager.openDialog('auth-form', {});
        return throwError(() => error);
      }
    })
  );
};
