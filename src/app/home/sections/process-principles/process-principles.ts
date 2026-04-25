import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Principle {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-process-principles',
  standalone: true,
  templateUrl: './process-principles.html',
  styleUrl: './process-principles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessPrinciplesComponent {
  protected indexLabel(i: number): string {
    const n = i + 1;
    return n < 10 ? `0${n}` : String(n);
  }

  protected readonly principles: readonly Principle[] = [
    {
      icon: 'pi pi-eye',
      title: 'Radical transparency',
      description:
        'Every stage has a clear written list of what you get. No black boxes, no surprise invoices, no "just trust me."',
    },
    {
      icon: 'pi pi-calendar',
      title: 'Fixed scope & price',
      description:
        'You approve the plan before we build. If you want to add or change something later, you get a written price first — not a running meter.',
    },
    {
      icon: 'pi pi-comments',
      title: 'Weekly real check-ins',
      description:
        'Every week: a short video update or a real phone call, your choice. You always know where we are and what is next.',
    },
    {
      icon: 'pi pi-lock',
      title: 'You own everything',
      description:
        'Your site files, your web address, hosting, and visitor numbers live in your accounts from day one. We are your partner, not a gatekeeper.',
    },
  ];
}
