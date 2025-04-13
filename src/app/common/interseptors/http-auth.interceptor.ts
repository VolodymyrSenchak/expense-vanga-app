import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService, AuthStore, DialogManager} from '@common/services';
import {catchError, Observable, of, switchMap, throwError} from 'rxjs';
import {AuthResult} from '@common/models/auth/auth-result.model';

export const HttpAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);
  const dialogManager = inject(DialogManager);
  const session = authStore.session;

  const refreshTokenMethod = (
    request: HttpRequest<any>,
    next: HttpHandlerFn,
  ): Observable<HttpEvent<any>> => {
    return authService.refreshToken(session?.refresh_token!).pipe(
      switchMap((res: AuthResult) => {
        authStore.user = res.user;
        authStore.session = res.session;
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
