import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './cta.html',
  styleUrl: './cta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaComponent {}
