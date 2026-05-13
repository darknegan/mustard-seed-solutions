import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type {
  ClientTodosResponse,
  ClientTodoPatchResponse,
  TodosSummaryResponse,
} from '@app/shared/todos/todos.models';
import { AuthService } from '@app/shared/services/auth.service';

@Injectable({ providedIn: 'root' })
export class TodosService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly _openCount = signal(0);
  readonly openCount = this._openCount.asReadonly();

  async fetchSummary(): Promise<void> {
    const token = this.auth.getStoredToken();
    if (!token) {
      this._openCount.set(0);
      return;
    }
    try {
      const res = await firstValueFrom(
        this.http.get<TodosSummaryResponse>('/api/client/todos/summary', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      this._openCount.set(res.openCount);
    } catch {
      this._openCount.set(0);
    }
  }

  async fetchGrouped(): Promise<ClientTodosResponse> {
    const token = this.auth.getStoredToken();
    if (!token) {
      return { open: [], completed: [] };
    }
    return firstValueFrom(
      this.http.get<ClientTodosResponse>('/api/client/todos', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
  }

  async patchTodoStatus(id: string, status: 'open' | 'done'): Promise<ClientTodoPatchResponse> {
    const token = this.auth.getStoredToken();
    if (!token) {
      throw new Error('You need to sign in again.');
    }
    return firstValueFrom(
      this.http.patch<ClientTodoPatchResponse>(
        `/api/client/todos/${encodeURIComponent(id)}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );
  }

  async refreshAfterMutation(): Promise<void> {
    await this.fetchSummary();
  }
}
