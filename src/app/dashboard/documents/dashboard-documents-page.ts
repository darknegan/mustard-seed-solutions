import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import {
  DOCUMENTS_SEEDED_EXAMPLE,
  emailShowsDashboardSeededExample,
} from '@app/shared/dashboard/dashboard-seeded-example';
import { AuthService } from '@app/shared/services/auth.service';

type DocumentAccent = 'sky' | 'orange' | 'violet' | 'muted';
type FolderId = 'all' | 'design' | 'copy' | 'launch';

interface ClientDocument {
  readonly title: string;
  readonly description: string;
  readonly type: string;
  readonly updated: string;
  readonly accent: DocumentAccent;
  readonly folder: Exclude<FolderId, 'all'>;
  readonly icon: string;
}

interface DocumentFolder {
  readonly id: FolderId;
  readonly label: string;
  readonly icon: string;
}

@Component({
  selector: 'app-dashboard-documents-page',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-documents-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardDocumentsPageComponent {
  private readonly auth = inject(AuthService);

  protected readonly activeFolderId = signal<FolderId>('all');
  protected readonly uploading = signal(false);

  protected readonly showSeededExample = computed(() =>
    emailShowsDashboardSeededExample(this.auth.user()?.email),
  );

  protected readonly introSummary = computed(() =>
    this.showSeededExample()
      ? 'Approvals, launch notes, and drafts—organized here instead of scattered across messages.'
      : 'When we share files with you, they will show up here by topic so everything stays easy to find.',
  );

  protected readonly folders: readonly DocumentFolder[] = [
    { id: 'all', label: 'All files', icon: 'pi pi-folder-open' },
    { id: 'design', label: 'Design approvals', icon: 'pi pi-palette' },
    { id: 'copy', label: 'Website copy', icon: 'pi pi-pen-to-square' },
    { id: 'launch', label: 'Launch details', icon: 'pi pi-flag-fill' },
  ];

  protected readonly documents = computed((): readonly ClientDocument[] => {
    return this.showSeededExample() ? [...DOCUMENTS_SEEDED_EXAMPLE] : [];
  });

  protected readonly visibleDocuments = computed(() => {
    const folderId = this.activeFolderId();
    const docs = this.documents();
    if (folderId === 'all') {
      return docs;
    }
    return docs.filter((doc) => doc.folder === folderId);
  });

  protected readonly folderCounts = computed(() => {
    const docs = this.documents();
    const counts: Record<FolderId, number> = { all: docs.length, design: 0, copy: 0, launch: 0 };
    for (const doc of docs) {
      counts[doc.folder] = counts[doc.folder] + 1;
    }
    return counts;
  });

  protected readonly companyDisplay = computed(() => {
    const user = this.auth.user();
    return user?.companyName?.trim() || 'your project';
  });

  protected setFolder(id: FolderId): void {
    this.activeFolderId.set(id);
  }

  protected countFor(id: FolderId): number {
    return this.folderCounts()[id];
  }

  protected onUpload(): void {
    this.uploading.set(true);
    setTimeout(() => this.uploading.set(false), 1200);
  }
}
