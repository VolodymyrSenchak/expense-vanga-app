import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpAuthInterceptor, HttpBaseUrlInterceptor} from '@common/interseptors';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions} from '@angular/material/form-field';
import {MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS, MatButtonToggleDefaultOptions} from '@angular/material/button-toggle';
import {MAT_CARD_CONFIG, MatCardConfig} from '@angular/material/card';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    provideNativeDateAdapter(),
    provideHttpClient(withInterceptors([
      HttpBaseUrlInterceptor,
      HttpAuthInterceptor
    ])),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: <MatFormFieldDefaultOptions>{ appearance: 'outline', floatLabel: 'always', subscriptSizing: 'dynamic' },
    },
    {
      provide: MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS,
      useValue: <MatButtonToggleDefaultOptions>{ hideSingleSelectionIndicator: true },
    },
    { provide: MAT_CARD_CONFIG, useValue: <MatCardConfig>{ appearance: 'outlined' } },
  ]
};
