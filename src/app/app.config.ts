import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpAuthInterceptor, HttpBaseUrlInterceptor} from '@common/interseptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    provideHttpClient(withInterceptors([
      HttpBaseUrlInterceptor,
      HttpAuthInterceptor
    ]))
  ]
};
