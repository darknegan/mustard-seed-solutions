import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type LoadingSpinnerColor = 'sky' | 'orange';
export type LoadingSpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    'aria-live': 'polite',
    '[attr.aria-label]': "label() ? null : 'Loading'",
    '[class.loading-spinner--sm]': "size() === 'sm'",
    '[class.loading-spinner--md]': "size() === 'md'",
    '[class.loading-spinner--lg]': "size() === 'lg'",
    '[class.loading-spinner--sky]': "color() === 'sky'",
    '[class.loading-spinner--orange]': "color() === 'orange'",
  },
})
export class LoadingSpinnerComponent {
  readonly size = input<LoadingSpinnerSize>('md');
  readonly color = input<LoadingSpinnerColor>('sky');
  readonly label = input('Loading');
}
