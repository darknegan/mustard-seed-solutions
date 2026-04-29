import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '@app/shared/services/auth.service';

interface DashboardNavItem {
  readonly label: string;
  readonly shortLabel: string;
  readonly route: string;
  readonly icon: 'overview' | 'documents' | 'request' | 'report';
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  protected readonly pageTitle = signal('Dashboard');
  protected readonly greeting = signal("Here's what's happening with your site today.");

  protected readonly navItems: readonly DashboardNavItem[] = [
    { label: 'Overview', shortLabel: 'Overview', route: '/dashboard', icon: 'overview' },
    { label: 'My Documents', shortLabel: 'Docs', route: '/dashboard/documents', icon: 'documents' },
    { label: 'Request a Change', shortLabel: 'Change', route: '/dashboard/request-change', icon: 'request' },
    { label: 'Report an Issue', shortLabel: 'Issue', route: '/dashboard/report-issue', icon: 'report' },
  ];

  constructor() {
    this.updatePageLabels();

    this.router.events
      .pipe(
        takeUntilDestroyed(),
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      )
      .subscribe(() => {
        this.updatePageLabels();
      });
  }

  protected signOut(): void {
    this.auth.logout();
  }

  private updatePageLabels(): void {
    let route = this.router.routerState.snapshot.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    this.pageTitle.set(
      typeof route.data['portalTitle'] === 'string' ? route.data['portalTitle'] : 'Dashboard',
    );
    this.greeting.set(
      typeof route.data['portalGreeting'] === 'string'
        ? route.data['portalGreeting']
        : "Here's what's happening with your site today.",
    );
  }
}
