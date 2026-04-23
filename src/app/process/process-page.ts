import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ProcessComponent } from '../home/sections/process/process';

@Component({
  selector: 'app-process-page',
  standalone: true,
  imports: [ProcessComponent],
  templateUrl: './process-page.html',
  styleUrl: './process-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessPageComponent {}
