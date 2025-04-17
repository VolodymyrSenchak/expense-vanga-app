import {signal} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';

export interface LoadingOptions {
  isLoading: boolean;
  message: string;
}

const MESSAGE = 'Loading...';

export class LoadingService {
  readonly loadingOptions = signal<LoadingOptions>({ isLoading: false, message: MESSAGE });

  async waitObservable<T>(observable: Observable<T>, customMessage: string = MESSAGE): Promise<T> {
    try {
      const message = customMessage ?? MESSAGE;
      this.loadingOptions.set({ isLoading: true, message: message });
      return await firstValueFrom(observable);
    } finally {
      this.loadingOptions.set({ isLoading: false, message: MESSAGE });
    }
  }

  async waitPromise<T>(promise: Promise<T>, customMessage: string = MESSAGE): Promise<T> {
    try {
      const message = customMessage ?? MESSAGE;
      this.loadingOptions.set({ isLoading: true, message: message });
      return await promise;
    } finally {
      this.loadingOptions.set({ isLoading: false, message: MESSAGE });
    }
  }
}
