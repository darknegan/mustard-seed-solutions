import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';

import { FooterComponent } from '@app/shared/footer/footer';
import { LoadingSpinnerComponent } from '@app/shared/loading-spinner/loading-spinner';
import { NavComponent } from '@app/shared/nav/nav';

const ROUTE_LOADING_MIN_VISIBLE_MS = 300;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, FooterComponent, LoadingSpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);

  protected readonly routeLoading = signal(false);
  protected readonly chromeHidden = signal(false);
  private routeLoadingHideTimer: ReturnType<typeof setTimeout> | undefined;
  private routeLoadingStartedAt = 0;
  private initialNavigationSettled = false;
  private latestNavId = 0;

  constructor() {
    this.router.events
      .pipe(
        takeUntilDestroyed(),
        filter(
          (e): e is NavigationStart | NavigationEnd | NavigationCancel | NavigationError =>
            e instanceof NavigationStart ||
            e instanceof NavigationEnd ||
            e instanceof NavigationCancel ||
            e instanceof NavigationError,
        ),
      )
      .subscribe((e) => {
        if (e instanceof NavigationStart) {
          this.latestNavId = e.id;
          if (this.initialNavigationSettled) {
            this.showRouteLoading();
          }
          return;
        }
        if (e.id === this.latestNavId) {
          this.updateChromeVisibility();
          this.markInitialSettled();
          this.completeRouteLoading();
        }
      });
  }

  private markInitialSettled(): void {
    this.initialNavigationSettled = true;
  }

  private showRouteLoading(): void {
    this.clearRouteLoadingHideTimer();
    this.routeLoadingStartedAt = Date.now();
    this.routeLoading.set(true);
  }

  private completeRouteLoading(): void {
    if (!this.routeLoading()) {
      return;
    }

    const elapsedMs = Date.now() - this.routeLoadingStartedAt;
    const remainingMs = ROUTE_LOADING_MIN_VISIBLE_MS - elapsedMs;

    if (remainingMs <= 0) {
      this.routeLoading.set(false);
      return;
    }

    this.clearRouteLoadingHideTimer();
    this.routeLoadingHideTimer = setTimeout(() => {
      this.routeLoadingHideTimer = undefined;
      this.routeLoading.set(false);
    }, remainingMs);
  }

  private clearRouteLoadingHideTimer(): void {
    if (this.routeLoadingHideTimer === undefined) {
      return;
    }

    clearTimeout(this.routeLoadingHideTimer);
    this.routeLoadingHideTimer = undefined;
  }

  private updateChromeVisibility(): void {
    let route = this.router.routerState.snapshot.root;
    let hideChrome = route.data['hideChrome'] === true;

    while (route.firstChild) {
      route = route.firstChild;
      hideChrome = hideChrome || route.data['hideChrome'] === true;
    }

    this.chromeHidden.set(hideChrome);
  }
}
