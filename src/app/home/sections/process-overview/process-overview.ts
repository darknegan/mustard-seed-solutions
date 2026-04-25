import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
interface PhaseChip {
  readonly num: string;
  readonly title: string;
}

interface StatLine {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-process-overview',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './process-overview.html',
  styleUrl: './process-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessOverviewComponent {
  protected readonly phases: readonly PhaseChip[] = [
    { num: '01', title: 'Discover' },
    { num: '02', title: 'Strategy' },
    { num: '03', title: 'Design' },
    { num: '04', title: 'Build' },
    { num: '05', title: 'Launch' },
    { num: '06', title: 'Nurture' },
  ];

  protected readonly stats: readonly StatLine[] = [
    { value: '6', label: 'Steps — each one documented' },
    { value: '2–8 wks', label: 'Typical start to go-live' },
    { value: '0', label: 'Surprise add-on bills — ever' },
    { value: '90d', label: 'We stand behind the work after launch' },
  ];
}
