import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';

interface FooterLink {
  readonly label: string;
  readonly href: string;
}

interface FooterColumn {
  readonly title: string;
  readonly links: readonly FooterLink[];
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [DividerModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly columns: readonly FooterColumn[] = [
    {
      title: 'Services',
      links: [
        { label: 'Launch Package', href: '/solutions' },
        { label: 'Growth Package', href: '/solutions' },
        { label: 'Partner Package', href: '/solutions' },
        { label: 'Care plans', href: '/solutions' },
      ],
    },
    {
      title: 'Studio',
      links: [
        { label: 'Process', href: '/process' },
        { label: 'About', href: '/about' },
        { label: 'Service area', href: '/about' },
        { label: 'Free consult', href: '/#contact' },
      ],
    },
    {
      title: 'Contact',
      links: [
        { label: 'hello@mustardseed.solutions', href: 'mailto:hello@mustardseed.solutions' },
        { label: 'Book a call', href: '/#contact' },
        { label: 'Northwest Arkansas', href: '/about' },
      ],
    },
  ];
}
