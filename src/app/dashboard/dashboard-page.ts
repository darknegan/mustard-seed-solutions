import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '@app/shared/services/auth.service';

interface DashboardNavItem {
  readonly label: string;
  readonly shortLabel: string;
  readonly route: string;
  readonly icon: string;
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
  protected readonly mobileMenuOpen = signal(false);

  protected readonly navItems: readonly DashboardNavItem[] = [
    {
      label: 'Overview',
      shortLabel: 'Overview',
      route: '/dashboard',
      icon: 'pi pi-th-large',
    },
    {
      label: 'My Documents',
      shortLabel: 'Docs',
      route: '/dashboard/documents',
      icon: 'pi pi-folder',
    },
    {
      label: 'Request a Change',
      shortLabel: 'Change',
      route: '/dashboard/request-change',
      icon: 'pi pi-pencil',
    },
    {
      label: 'Report an Issue',
      shortLabel: 'Issue',
      route: '/dashboard/report-issue',
      icon: 'pi pi-flag-fill',
    },
  ];

  protected readonly avatarInitials = computed(() => {
    const user = this.auth.user();
    if (!user) {
      return '';
    }
    const first = user.firstName?.trim().charAt(0) ?? '';
    const last = user.lastName?.trim().charAt(0) ?? '';
    const combined = `${first}${last}`.toUpperCase();
    if (combined) {
      return combined;
    }
    return user.companyName?.trim().charAt(0).toUpperCase() ?? '';
  });

  protected readonly companyDisplay = computed(() => {
    const user = this.auth.user();
    if (!user) {
      return 'Client portal';
    }
    return user.companyName?.trim() || `${user.firstName} ${user.lastName}`.trim() || 'Client portal';
  });

  protected readonly siteHostDisplay = computed(() => {
    const user = this.auth.user();
    const company = user?.companyName?.trim();
    if (!company) {
      return 'Your site is live';
    }
    const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, '');
    return slug ? `${slug}.com` : 'Your site is live';
  });

  constructor() {
    this.updatePageLabels();

    this.router.events
      .pipe(
        takeUntilDestroyed(),
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      )
      .subscribe(() => {
        this.updatePageLabels();
        this.mobileMenuOpen.set(false);
      });
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
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
