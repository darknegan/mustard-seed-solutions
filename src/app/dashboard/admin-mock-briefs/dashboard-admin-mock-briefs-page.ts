import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  messageFromMockBriefHttpError,
  type MockPlanningBriefListItem,
  type MockPlanningBriefListResponse,
} from '@app/shared/mock-planning-brief/mock-planning-brief.models';
import { AuthService } from '@app/shared/services/auth.service';

@Component({
  selector: 'app-dashboard-admin-mock-briefs-page',
  standalone: true,
  templateUrl: './dashboard-admin-mock-briefs-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAdminMockBriefsPageComponent implements OnInit {
  private static readonly loadFailureFallback = 'Could not load briefs. Please try again.';

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  protected readonly briefs = signal<readonly MockPlanningBriefListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    void this.load();
  }

  protected formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  private async load(): Promise<void> {
    const token = this.auth.getStoredToken();
    if (!token) {
      this.errorMessage.set('You need to sign in again.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const res = await firstValueFrom(
        this.http.get<MockPlanningBriefListResponse>('/api/admin/mock-planning-briefs', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      this.briefs.set(res.briefs);
    } catch (err: unknown) {
      this.errorMessage.set(this.resolveLoadError(err));
    } finally {
      this.loading.set(false);
    }
  }

  private resolveLoadError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      return messageFromMockBriefHttpError(err);
    }
    if (err instanceof Error && err.message.trim().length > 0) {
      return err.message;
    }
    return DashboardAdminMockBriefsPageComponent.loadFailureFallback;
  }
}
