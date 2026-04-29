import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ClientDocument {
  readonly title: string;
  readonly description: string;
  readonly type: string;
  readonly updated: string;
  readonly tone: 'sky' | 'orange' | 'muted';
}

interface DocumentFolder {
  readonly label: string;
  readonly count: number;
}

@Component({
  selector: 'app-dashboard-documents-page',
  standalone: true,
  templateUrl: './dashboard-documents-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardDocumentsPageComponent {
  protected readonly folders: readonly DocumentFolder[] = [
    { label: 'All files', count: 7 },
    { label: 'Design approvals', count: 3 },
    { label: 'Website copy', count: 2 },
    { label: 'Launch details', count: 2 },
  ];

  protected readonly documents: readonly ClientDocument[] = [
    {
      title: 'Homepage approval notes',
      description: 'The latest signed-off notes for your homepage sections.',
      type: 'Design approval',
      updated: 'Updated 2 days ago',
      tone: 'sky',
    },
    {
      title: 'Staff bio updates',
      description: 'Text and image changes requested for the team section.',
      type: 'Website copy',
      updated: 'Updated 5 days ago',
      tone: 'orange',
    },
    {
      title: 'Launch checklist',
      description: 'A plain-English list of what was completed before launch.',
      type: 'Launch details',
      updated: 'Updated 2 weeks ago',
      tone: 'muted',
    },
    {
      title: 'Domain and email notes',
      description: 'Where your web address points and what stays connected.',
      type: 'Launch details',
      updated: 'Updated 3 weeks ago',
      tone: 'muted',
    },
  ];
}
