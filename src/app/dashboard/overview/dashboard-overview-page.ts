import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DashboardStat {
  readonly label: string;
  readonly value: string;
  readonly caption: string;
  readonly tone?: 'sky' | 'primary';
  readonly badge?: string;
}

interface ActivityItem {
  readonly title: string;
  readonly time: string;
  readonly description: string;
  readonly tone: 'sky' | 'orange' | 'green' | 'muted';
}

interface QuickAction {
  readonly label: string;
  readonly description: string;
  readonly tone: 'sky' | 'orange' | 'muted';
  readonly route: string;
}

@Component({
  selector: 'app-dashboard-overview-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-overview-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOverviewPageComponent {
  protected readonly stats: readonly DashboardStat[] = [
    {
      label: 'Site health',
      value: 'Live',
      caption: 'adventurecon.com is online',
      tone: 'sky',
      badge: 'Healthy',
    },
    {
      label: 'Open requests',
      value: '2',
      caption: 'Changes pending review',
    },
    {
      label: 'Documents',
      value: '7',
      caption: 'Files in your library',
    },
  ];

  protected readonly activities: readonly ActivityItem[] = [
    {
      title: 'Homepage sections approved',
      time: '2 days ago',
      description: 'Hero, About, and contact sections reviewed and signed off.',
      tone: 'sky',
    },
    {
      title: 'Change request submitted',
      time: '5 days ago',
      description: 'Updated bio text and new staff photo requested.',
      tone: 'orange',
    },
    {
      title: 'Site went live',
      time: '2 weeks ago',
      description: 'adventurecon.com is live and showing in search.',
      tone: 'green',
    },
    {
      title: 'Secure connection turned on',
      time: '3 weeks ago',
      description: 'Your web address now opens with a secure connection.',
      tone: 'muted',
    },
  ];

  protected readonly quickActions: readonly QuickAction[] = [
    {
      label: 'Request a Change',
      description: 'Submit a site update request',
      tone: 'sky',
      route: '/dashboard/request-change',
    },
    {
      label: 'Report an Issue',
      description: 'Flag a bug or problem',
      tone: 'orange',
      route: '/dashboard/report-issue',
    },
    {
      label: 'View My Documents',
      description: 'Access your project files',
      tone: 'muted',
      route: '/dashboard/documents',
    },
  ];
}
