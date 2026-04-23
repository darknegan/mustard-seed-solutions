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
        'Every stage has a published deliverable. No black boxes, no surprise invoices, no "just trust me".',
    },
    {
      icon: 'pi pi-calendar',
      title: 'Fixed scope & price',
      description:
        'You sign off on scope before we build. Change requests are quoted in writing — no hourly drift.',
    },
    {
      icon: 'pi pi-comments',
      title: 'Weekly real check-ins',
      description:
        'Every Friday: a Loom video or real call. You always know where we are and what is next.',
    },
    {
      icon: 'pi pi-lock',
      title: 'You own everything',
      description:
        'Code, domain, hosting, analytics, CMS — in your accounts, from day one. No vendor lock-in.',
    },
  ];
}
