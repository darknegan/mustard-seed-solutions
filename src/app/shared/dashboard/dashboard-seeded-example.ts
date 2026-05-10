/**
 * Demo dashboard content for local/product development.
 * Production accounts should see empty-state data until APIs back these sections.
 */
export const DASHBOARD_SEEDED_EXAMPLE_EMAIL = 'drakedavisdev@gmail.com' as const;

export function emailShowsDashboardSeededExample(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  return email.trim().toLowerCase() === DASHBOARD_SEEDED_EXAMPLE_EMAIL;
}

export type DashboardOverviewStatAccent = 'sky' | 'orange' | 'violet' | 'muted';
export type DashboardOverviewStatStatus = 'success' | 'warn' | 'info';

export interface DashboardOverviewStatSeed {
  readonly label: string;
  readonly value: string;
  readonly caption: string;
  readonly accent: DashboardOverviewStatAccent;
  readonly badge?: string;
  readonly status?: DashboardOverviewStatStatus;
}

/** Example overview metrics — keep in sync with future API shape when wiring real data. */
export const OVERVIEW_STATS_SEEDED_EXAMPLE: readonly DashboardOverviewStatSeed[] = [
  {
    label: 'Site status',
    value: 'Live',
    caption: 'Your site is online and visible to visitors.',
    accent: 'sky',
    badge: 'Healthy',
    status: 'success',
  },
  {
    label: 'Open requests',
    value: '2',
    caption: 'Changes pending review.',
    accent: 'orange',
  },
  {
    label: 'Documents',
    value: '7',
    caption: 'Files in your library.',
    accent: 'violet',
  },
];

export const OVERVIEW_STATS_EMPTY: readonly DashboardOverviewStatSeed[] = [
  {
    label: 'Site status',
    value: '—',
    caption: 'We will show whether your site is live here once it is connected.',
    accent: 'muted',
  },
  {
    label: 'Open requests',
    value: '0',
    caption: 'No change requests in progress yet.',
    accent: 'orange',
  },
  {
    label: 'Documents',
    value: '0',
    caption: 'Nothing shared to your library yet.',
    accent: 'violet',
  },
];

export interface DashboardOverviewActivitySeed {
  readonly title: string;
  readonly time: string;
  readonly description: string;
  readonly accent: 'sky' | 'orange' | 'success' | 'muted';
}

/** Example activity timeline — keep for mocks and Storybook-style previews. */
export const OVERVIEW_ACTIVITIES_SEEDED_EXAMPLE: readonly DashboardOverviewActivitySeed[] = [
  {
    title: 'Homepage sections approved',
    time: '2 days ago',
    description: 'Hero, About, and contact sections reviewed and signed off.',
    accent: 'sky',
  },
  {
    title: 'Change request submitted',
    time: '5 days ago',
    description: 'Updated bio text and a new staff photo are queued for review.',
    accent: 'orange',
  },
  {
    title: 'Site went live',
    time: '2 weeks ago',
    description: 'Your site is live and showing up in search results.',
    accent: 'success',
  },
  {
    title: 'Secure connection turned on',
    time: '3 weeks ago',
    description: 'Your web address now opens with a secure connection.',
    accent: 'muted',
  },
];

export type DocumentSeedAccent = 'sky' | 'orange' | 'violet' | 'muted';
export type DocumentSeedFolder = 'all' | 'design' | 'copy' | 'launch';

export interface DashboardDocumentSeed {
  readonly title: string;
  readonly description: string;
  readonly type: string;
  readonly updated: string;
  readonly accent: DocumentSeedAccent;
  readonly folder: Exclude<DocumentSeedFolder, 'all'>;
  readonly icon: string;
}

/** Example document rows — keep for mocks when wiring storage. */
export const DOCUMENTS_SEEDED_EXAMPLE: readonly DashboardDocumentSeed[] = [
  {
    title: 'Homepage approval notes',
    description: 'The latest signed-off notes for your homepage sections.',
    type: 'Design approval',
    updated: 'Updated 2 days ago',
    accent: 'sky',
    folder: 'design',
    icon: 'pi pi-check-circle',
  },
  {
    title: 'Staff bio updates',
    description: 'Text and image changes requested for the team section.',
    type: 'Website copy',
    updated: 'Updated 5 days ago',
    accent: 'orange',
    folder: 'copy',
    icon: 'pi pi-pen-to-square',
  },
  {
    title: 'Launch checklist',
    description: 'A plain-English list of what was completed before launch.',
    type: 'Launch details',
    updated: 'Updated 2 weeks ago',
    accent: 'violet',
    folder: 'launch',
    icon: 'pi pi-list',
  },
  {
    title: 'Domain and email notes',
    description: 'Where your web address points and what stays connected.',
    type: 'Launch details',
    updated: 'Updated 3 weeks ago',
    accent: 'muted',
    folder: 'launch',
    icon: 'pi pi-globe',
  },
];
