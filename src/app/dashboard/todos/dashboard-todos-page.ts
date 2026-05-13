import { HttpErrorResponse } from '@angular/common/http';

import {

  ChangeDetectionStrategy,

  Component,

  computed,

  inject,

  signal,

} from '@angular/core';

import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';



import { TodosService } from '@app/shared/services/todos.service';

import type { ClientTodoItem } from '@app/shared/todos/todos.models';

import { messageFromTodosHttpError } from '@app/shared/todos/todos.models';



type TodoRowAccent = 'sky' | 'orange' | 'violet' | 'muted';

type NextDueAccent = 'sky' | 'orange' | 'violet';



interface NextDueStat {

  readonly value: string;

  readonly caption: string;

  readonly accent: NextDueAccent;

}



@Component({

  selector: 'app-dashboard-todos-page',

  standalone: true,

  imports: [ButtonModule, RouterLink],

  templateUrl: './dashboard-todos-page.html',

  styleUrl: './dashboard-todos-page.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,

})

export class DashboardTodosPageComponent {

  private static readonly loadFailureFallback = 'Could not load your tasks. Please try again.';



  private readonly todosService = inject(TodosService);



  protected readonly openTodos = signal<readonly ClientTodoItem[]>([]);

  protected readonly completedTodos = signal<readonly ClientTodoItem[]>([]);

  protected readonly loading = signal(true);

  protected readonly errorMessage = signal('');

  protected readonly mutatingId = signal<string | null>(null);



  protected readonly openCount = computed((): number => this.openTodos().length);

  protected readonly completedCount = computed((): number => this.completedTodos().length);



  protected readonly nextDueStat = computed((): NextDueStat => {

    const open: readonly ClientTodoItem[] = this.openTodos();

    const dated: { readonly time: number }[] = [];

    for (const t of open) {

      const raw: string | null = t.dueAt;

      if (raw === null || raw.trim().length === 0) {

        continue;

      }

      const time: number = new Date(raw).getTime();

      if (!Number.isNaN(time)) {

        dated.push({ time });

      }

    }

    dated.sort((a, b) => a.time - b.time);

    const first: { readonly time: number } | undefined = dated[0];

    if (first === undefined) {

      return {

        value: '—',

        caption: 'No due dates on open tasks',

        accent: 'violet',

      };

    }

    const d: Date = new Date(first.time);

    return {

      value: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),

      caption: 'Nearest due date on your open list',

      accent: 'orange',

    };

  });



  constructor() {

    void this.load();

  }



  protected isVirtualId(id: string): boolean {

    return id.startsWith('virtual:');

  }



  protected hasDescription(todo: ClientTodoItem): boolean {

    return todo.description.trim().length > 0;

  }



  protected showCategoryChip(category: string): boolean {

    return this.categoryLabel(category).length > 0;

  }



  protected categoryLabel(category: string): string {

    const c: string = category.trim().toLowerCase();

    const map: Record<string, string> = {

      planning: 'Planning',

      general: 'General',

      content: 'Content & media',

      access: 'Access & logins',

    };

    const mapped: string | undefined = map[c];

    if (mapped !== undefined) {

      return mapped;

    }

    const t: string = category.trim();

    if (t.length === 0) {

      return '';

    }

    return t.charAt(0).toUpperCase() + t.slice(1);

  }



  protected todoRowAccent(todo: ClientTodoItem): TodoRowAccent {

    const c: string = todo.category.trim().toLowerCase();

    if (c === 'planning') {

      return 'violet';

    }

    if (c === 'content') {

      return 'orange';

    }

    if (c === 'access') {

      return 'sky';

    }

    return 'muted';

  }



  protected formatDue(iso: string | null): string {

    if (!iso) {

      return '';

    }

    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {

      return '';

    }

    return d.toLocaleDateString(undefined, { dateStyle: 'medium' });

  }



  protected formatCompleted(iso: string | null): string {

    if (!iso) {

      return '';

    }

    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {

      return iso;

    }

    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  }



  protected async load(): Promise<void> {

    this.loading.set(true);

    this.errorMessage.set('');

    try {

      const res = await this.todosService.fetchGrouped();

      this.openTodos.set(res.open);

      this.completedTodos.set(res.completed);

      await this.todosService.fetchSummary();

    } catch (caught) {

      if (caught instanceof HttpErrorResponse || caught instanceof Error) {

        this.errorMessage.set(this.resolveLoadError(caught));

      } else {

        this.errorMessage.set(DashboardTodosPageComponent.loadFailureFallback);

      }

    } finally {

      this.loading.set(false);

    }

  }



  protected async markDone(todo: ClientTodoItem): Promise<void> {

    if (this.isVirtualId(todo.id)) {

      return;

    }

    this.mutatingId.set(todo.id);

    this.errorMessage.set('');

    try {

      await this.todosService.patchTodoStatus(todo.id, 'done');

      await this.load();

      await this.todosService.refreshAfterMutation();

    } catch (caught) {

      if (caught instanceof HttpErrorResponse || caught instanceof Error) {

        this.errorMessage.set(this.resolveMutationError(caught));

      } else {

        this.errorMessage.set('Could not update that task. Please try again.');

      }

    } finally {

      this.mutatingId.set(null);

    }

  }



  protected async markOpen(todo: ClientTodoItem): Promise<void> {

    if (this.isVirtualId(todo.id)) {

      return;

    }

    this.mutatingId.set(todo.id);

    this.errorMessage.set('');

    try {

      await this.todosService.patchTodoStatus(todo.id, 'open');

      await this.load();

      await this.todosService.refreshAfterMutation();

    } catch (caught) {

      if (caught instanceof HttpErrorResponse || caught instanceof Error) {

        this.errorMessage.set(this.resolveMutationError(caught));

      } else {

        this.errorMessage.set('Could not update that task. Please try again.');

      }

    } finally {

      this.mutatingId.set(null);

    }

  }



  private resolveLoadError(err: HttpErrorResponse | Error): string {

    if (err instanceof HttpErrorResponse) {

      return messageFromTodosHttpError(err);

    }

    if (err instanceof Error && err.message.trim().length > 0) {

      return err.message;

    }

    return DashboardTodosPageComponent.loadFailureFallback;

  }



  private resolveMutationError(err: HttpErrorResponse | Error): string {

    if (err instanceof HttpErrorResponse) {

      return messageFromTodosHttpError(err);

    }

    if (err instanceof Error && err.message.trim().length > 0) {

      return err.message;

    }

    return 'Could not update that task. Please try again.';

  }

}

