import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AboutComponent } from '../home/sections/about/about';
import { CtaComponent } from '../home/sections/cta/cta';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [AboutComponent, CtaComponent],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPageComponent {}
