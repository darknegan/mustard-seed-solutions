import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CtaComponent } from './sections/cta/cta';
import { HeroComponent } from './sections/hero/hero';
import { ProcessComponent } from './sections/process/process';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, ProcessComponent, CtaComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
