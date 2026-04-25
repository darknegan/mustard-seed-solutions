import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

interface NavLink {
  readonly label: string;
  readonly href: string;
}

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent {
  protected readonly mobileOpen = signal(false);

  protected readonly links: readonly NavLink[] = [
    { label: 'Home', href: '/' },
    { label: 'Process', href: '/process' },
    { label: 'About', href: '/about' },
    { label: 'Solutions', href: '/solutions' },
  ];

  protected toggleMobile(): void {
    this.mobileOpen.update((open) => !open);
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
