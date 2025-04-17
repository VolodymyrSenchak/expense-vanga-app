import {Component, input} from '@angular/core';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {LoadingOptions} from '@common/services';

@Component({
  selector: 'app-loading',
  imports: [
    MatProgressSpinnerModule,
  ],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  readonly loadingOptions = input<LoadingOptions>();
  readonly mode = input<'spinner' | 'skeleton'>('spinner');
  readonly skeletonBody = input<Array<[string, string]>>();
}
