import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CtaComponent } from './sections/cta/cta';
import { HeroComponent } from './sections/hero/hero';
import { ProcessOverviewComponent } from './sections/process-overview/process-overview';
import { ProcessPrinciplesComponent } from './sections/process-principles/process-principles';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, ProcessOverviewComponent, ProcessPrinciplesComponent, CtaComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
