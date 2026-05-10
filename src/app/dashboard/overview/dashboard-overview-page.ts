import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  emailShowsDashboardSeededExample,
  OVERVIEW_ACTIVITIES_SEEDED_EXAMPLE,
  OVERVIEW_STATS_EMPTY,
  OVERVIEW_STATS_SEEDED_EXAMPLE,
  type DashboardOverviewActivitySeed,
  type DashboardOverviewStatSeed,
} from '@app/shared/dashboard/dashboard-seeded-example';
import { AuthService } from '@app/shared/services/auth.service';

type DashboardAccent = 'sky' | 'orange' | 'violet' | 'muted';
type StatStatus = 'success' | 'warn' | 'info';

interface DashboardStat {
  readonly label: string;
  readonly value: string;
  readonly caption: string;
  readonly accent: DashboardAccent;
  readonly badge?: string;
  readonly status?: StatStatus;
}

interface ActivityItem {
  readonly title: string;
  readonly time: string;
  readonly description: string;
  readonly accent: 'sky' | 'orange' | 'success' | 'muted';
}

interface QuickAction {
  readonly label: string;
  readonly description: string;
  readonly accent: DashboardAccent;
  readonly icon: string;
  readonly route: string;
}

function mapStat(seed: DashboardOverviewStatSeed): DashboardStat {
  return {
    label: seed.label,
    value: seed.value,
    caption: seed.caption,
    accent: seed.accent,
    ...(seed.badge !== undefined ? { badge: seed.badge } : {}),
    ...(seed.status !== undefined ? { status: seed.status } : {}),
  };
}

function mapActivity(seed: DashboardOverviewActivitySeed): ActivityItem {
  return {
    title: seed.title,
    time: seed.time,
    description: seed.description,
    accent: seed.accent,
  };
}

@Component({
  selector: 'app-dashboard-overview-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-overview-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOverviewPageComponent {
  private readonly auth = inject(AuthService);

  protected readonly showSeededExample = computed(() =>
    emailShowsDashboardSeededExample(this.auth.user()?.email),
  );

  protected readonly introSummary = computed(() =>
    this.showSeededExample()
      ? 'Site status, recent updates, and shortcuts—so nothing hides in email threads.'
      : 'We are getting your workspace ready. Status counts and updates will show up here once your project is connected.',
  );

  protected readonly stats = computed((): readonly DashboardStat[] => {
    const seeds = this.showSeededExample() ? OVERVIEW_STATS_SEEDED_EXAMPLE : OVERVIEW_STATS_EMPTY;
    return seeds.map(mapStat);
  });

  protected readonly activities = computed((): readonly ActivityItem[] => {
    return this.showSeededExample()
      ? OVERVIEW_ACTIVITIES_SEEDED_EXAMPLE.map(mapActivity)
      : [];
  });

  /** Shown when the activity list has no rows (real accounts start empty; demo account normally has rows). */
  protected readonly activityEmptyMessage = computed(() =>
    this.showSeededExample()
      ? 'Once we make changes or share notes, they will show up here.'
      : 'When there are updates on your site or messages from our team, they will appear here so you do not have to dig through email.',
  );

  protected readonly quickActions: readonly QuickAction[] = [
    {
      label: 'Request a change',
      description: 'Send us a quick site update.',
      accent: 'sky',
      icon: 'pi pi-pencil',
      route: '/dashboard/request-change',
    },
    {
      label: 'Report an issue',
      description: 'Flag something that looks wrong.',
      accent: 'orange',
      icon: 'pi pi-flag-fill',
      route: '/dashboard/report-issue',
    },
    {
      label: 'View your documents',
      description: 'Open the file library.',
      accent: 'violet',
      icon: 'pi pi-folder',
      route: '/dashboard/documents',
    },
  ];
}
