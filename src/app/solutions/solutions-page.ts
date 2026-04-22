import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SolutionsComponent } from '../home/sections/solutions/solutions';

@Component({
  selector: 'app-solutions-page',
  standalone: true,
  imports: [SolutionsComponent],
  templateUrl: './solutions-page.html',
  styleUrl: './solutions-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionsPageComponent {}
