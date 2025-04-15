import { HttpInterceptorFn} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export const HttpBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl;

  // Prepend the base URL if the request URL is relative
  const apiReq = req.url.startsWith('http')
    ? req
    : req.clone({ url: `${apiUrl}/${req.url}` });

  return next(apiReq);
};
