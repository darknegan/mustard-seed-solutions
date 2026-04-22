import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AboutComponent } from '../home/sections/about/about';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [AboutComponent],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPageComponent {}
