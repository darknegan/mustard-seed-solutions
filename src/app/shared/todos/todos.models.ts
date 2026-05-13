import type { HttpErrorResponse } from '@angular/common/http';

export interface ClientTodoItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly status: string;
  readonly dueAt: string | null;
  readonly source: string;
  readonly sourceKey: string | null;
  readonly actionRoute: string | null;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedAt: string | null;
}

export interface ClientTodosResponse {
  readonly open: readonly ClientTodoItem[];
  readonly completed: readonly ClientTodoItem[];
}

export interface TodosSummaryResponse {
  readonly openCount: number;
}

export interface ClientTodoPatchResponse {
  readonly todo: ClientTodoItem;
}

interface TodoErrorMessageBody {
  readonly error: string;
}

function isTodoErrorMessageBody(value: object): value is TodoErrorMessageBody {
  return typeof Reflect.get(value, 'error') === 'string';
}

export function messageFromTodosHttpError(error: HttpErrorResponse): string {
  const body = error.error;
  if (typeof body === 'object' && body !== null && isTodoErrorMessageBody(body)) {
    return body.error;
  }
  return 'Something went wrong. Please try again.';
}

export interface AdminTodosListResponse {
  readonly userId: string;
  readonly todos: readonly ClientTodoItem[];
}
