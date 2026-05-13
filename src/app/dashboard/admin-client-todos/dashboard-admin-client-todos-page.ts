import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '@app/shared/services/auth.service';
import type { AdminTodosListResponse, ClientTodoItem } from '@app/shared/todos/todos.models';
import { messageFromTodosHttpError } from '@app/shared/todos/todos.models';

@Component({
  selector: 'app-dashboard-admin-client-todos-page',
  standalone: true,
  imports: [ButtonModule, ReactiveFormsModule],
  templateUrl: './dashboard-admin-client-todos-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAdminClientTodosPageComponent {
  private static readonly loadFailureFallback = 'Could not load tasks. Please try again.';

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly searchForm = this.fb.group({
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
  });

  protected readonly createForm = this.fb.group({
    title: this.fb.control('', { validators: [Validators.required, Validators.maxLength(500)] }),
    description: this.fb.control('', { validators: [Validators.maxLength(20000)] }),
    category: this.fb.control('general', { validators: [Validators.required] }),
    dueAt: this.fb.control(''),
  });

  protected readonly todos = signal<readonly ClientTodoItem[]>([]);
  protected readonly targetUserId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly mutatingId = signal<string | null>(null);

  protected async loadForEmail(): Promise<void> {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const token = this.auth.getStoredToken();
    if (!token) {
      this.errorMessage.set('You need to sign in again.');
      return;
    }

    const email = this.searchForm.controls.email.value.trim();
    this.loading.set(true);
    this.errorMessage.set('');
    this.todos.set([]);
    this.targetUserId.set(null);

    try {
      const res = await firstValueFrom(
        this.http.get<AdminTodosListResponse>(`/api/admin/todos?email=${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      this.targetUserId.set(res.userId);
      this.todos.set(res.todos);
    } catch (caught) {
      if (caught instanceof HttpErrorResponse) {
        this.errorMessage.set(messageFromTodosHttpError(caught));
      } else if (caught instanceof Error && caught.message.trim().length > 0) {
        this.errorMessage.set(caught.message);
      } else {
        this.errorMessage.set(DashboardAdminClientTodosPageComponent.loadFailureFallback);
      }
    } finally {
      this.loading.set(false);
    }
  }

  protected async createTodo(): Promise<void> {
    const userId = this.targetUserId();
    if (!userId) {
      this.errorMessage.set('Load a client by email first.');
      return;
    }
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const token = this.auth.getStoredToken();
    if (!token) {
      this.errorMessage.set('You need to sign in again.');
      return;
    }

    const raw = this.createForm.getRawValue();
    const dueTrim = raw.dueAt.trim();
    const body: {
      userId: string;
      title: string;
      description: string;
      category: string;
      dueAt?: string;
    } = {
      userId,
      title: raw.title.trim(),
      description: raw.description.trim(),
      category: raw.category,
    };
    if (dueTrim.length > 0) {
      body.dueAt = dueTrim;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    try {
      await firstValueFrom(
        this.http.post('/api/admin/todos', body, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      this.createForm.patchValue({
        title: '',
        description: '',
        category: 'general',
        dueAt: '',
      });
      await this.reloadTodos(token, userId);
    } catch (caught) {
      if (caught instanceof HttpErrorResponse) {
        this.errorMessage.set(messageFromTodosHttpError(caught));
      } else if (caught instanceof Error && caught.message.trim().length > 0) {
        this.errorMessage.set(caught.message);
      } else {
        this.errorMessage.set('Could not create that task.');
      }
    } finally {
      this.saving.set(false);
    }
  }

  protected async removeTodo(id: string): Promise<void> {
    const token = this.auth.getStoredToken();
    const userId = this.targetUserId();
    if (!token || !userId) {
      return;
    }
    this.mutatingId.set(id);
    this.errorMessage.set('');
    try {
      await firstValueFrom(
        this.http.delete(`/api/admin/todos/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
          observe: 'response',
        }),
      );
      await this.reloadTodos(token, userId);
    } catch (caught) {
      if (caught instanceof HttpErrorResponse) {
        this.errorMessage.set(messageFromTodosHttpError(caught));
      } else if (caught instanceof Error && caught.message.trim().length > 0) {
        this.errorMessage.set(caught.message);
      } else {
        this.errorMessage.set('Could not remove that task.');
      }
    } finally {
      this.mutatingId.set(null);
    }
  }

  protected async setTodoStatus(id: string, status: 'open' | 'done'): Promise<void> {
    const token = this.auth.getStoredToken();
    const userId = this.targetUserId();
    if (!token || !userId) {
      return;
    }
    this.mutatingId.set(id);
    this.errorMessage.set('');
    try {
      await firstValueFrom(
        this.http.patch(
          `/api/admin/todos/${encodeURIComponent(id)}`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      );
      await this.reloadTodos(token, userId);
    } catch (caught) {
      if (caught instanceof HttpErrorResponse) {
        this.errorMessage.set(messageFromTodosHttpError(caught));
      } else if (caught instanceof Error && caught.message.trim().length > 0) {
        this.errorMessage.set(caught.message);
      } else {
        this.errorMessage.set('Could not update that task.');
      }
    } finally {
      this.mutatingId.set(null);
    }
  }

  protected formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  private async reloadTodos(token: string, userId: string): Promise<void> {
    const email = this.searchForm.controls.email.value.trim();
    const res = await firstValueFrom(
      this.http.get<AdminTodosListResponse>(
        email.length > 0
          ? `/api/admin/todos?email=${encodeURIComponent(email)}`
          : `/api/admin/todos?userId=${encodeURIComponent(userId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );
    this.todos.set(res.todos);
  }
}
