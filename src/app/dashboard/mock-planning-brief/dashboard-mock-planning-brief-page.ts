import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';

import {
  messageFromMockBriefHttpError,
  type MockPlanningBriefCreatedResponse,
  type MockPlanningBriefSubmitPayload,
} from '@app/shared/mock-planning-brief/mock-planning-brief.models';
import { AuthService } from '@app/shared/services/auth.service';
import { TodosService } from '@app/shared/services/todos.service';

interface CoachCard {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

interface MockBriefStepMeta {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
}

type MockBriefFormKey = keyof MockPlanningBriefSubmitPayload;

const DRAFT_KEYS: readonly (keyof MockPlanningBriefSubmitPayload)[] = [
  'projectName',
  'primaryGoal',
  'audience',
  'mustHavePages',
  'brandNotes',
  'references',
  'deadline',
];

function draftStorageKey(userId: string): string {
  return `mss_design_planning_draft_${userId}`;
}

function parseDraftJson(raw: string): Partial<Record<keyof MockPlanningBriefSubmitPayload, string>> | null {
  let parsed: object;
  try {
    parsed = JSON.parse(raw) as object;
  } catch {
    return null;
  }
  const out: Partial<Record<keyof MockPlanningBriefSubmitPayload, string>> = {};
  for (const key of DRAFT_KEYS) {
    const v = Reflect.get(parsed, key);
    if (typeof v === 'string') {
      out[key] = v;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

@Component({
  selector: 'app-dashboard-mock-planning-brief-page',
  standalone: true,
  imports: [ButtonModule, ReactiveFormsModule],
  templateUrl: './dashboard-mock-planning-brief-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardMockPlanningBriefPageComponent {
  private static readonly submitFailureFallback = 'Something went wrong. Please try again.';

  private static readonly stepFieldKeys: readonly (readonly MockBriefFormKey[])[] = [
    ['projectName', 'primaryGoal'],
    ['audience', 'mustHavePages'],
    ['brandNotes', 'references', 'deadline'],
  ];

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly todos = inject(TodosService);

  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly currentStep = signal(0);

  protected readonly briefSteps: readonly MockBriefStepMeta[] = [
    {
      id: 'project-goal',
      title: 'Project & goal',
      summary: 'Working title and the main outcome you want from the first design previews.',
    },
    {
      id: 'audience-pages',
      title: 'Audience & pages',
      summary: 'Who visits your site and which pages matter in the first pass.',
    },
    {
      id: 'look-timing',
      title: 'Look & timing',
      summary: 'Brand notes, examples you like, and when you need a first draft.',
    },
  ];

  protected readonly coachCards: readonly CoachCard[] = [
    {
      id: 'what-design-previews',
      title: 'What you will see first',
      description:
        'A clickable preview of layout and content so you can react before anything is final—not the live site yet.',
    },
    {
      id: 'helps',
      title: 'What helps most',
      description: 'Clear goals, one main audience you care about, and two or three example sites you like.',
    },
    {
      id: 'next',
      title: 'What happens next',
      description: 'We read your answers, follow up if anything is unclear, and send a timeline for the first design preview pass.',
    },
  ];

  protected readonly form = this.fb.group({
    projectName: ['', [Validators.required, Validators.minLength(2)]],
    primaryGoal: ['Launch a new site', Validators.required],
    audience: ['', [Validators.required, Validators.minLength(12)]],
    mustHavePages: ['', [Validators.required, Validators.minLength(12)]],
    brandNotes: [''],
    references: [''],
    deadline: ['Flexible', Validators.required],
  });

  constructor() {
    this.restoreDraftIfPresent();

    this.form.valueChanges
      .pipe(debounceTime(800), takeUntilDestroyed())
      .subscribe(() => {
        if (!this.submitted()) {
          this.persistDraft();
        }
      });
  }

  protected isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  protected stepVisualState(stepIndex: number): 'done' | 'current' | 'upcoming' {
    if (this.submitted()) {
      return 'done';
    }
    const active = this.currentStep();
    if (stepIndex < active) {
      return 'done';
    }
    if (stepIndex === active) {
      return 'current';
    }
    return 'upcoming';
  }

  protected canJumpToStep(stepIndex: number): boolean {
    return !this.submitted() && stepIndex < this.currentStep() && stepIndex >= 0;
  }

  protected goToStep(stepIndex: number): void {
    if (!this.canJumpToStep(stepIndex)) {
      return;
    }
    this.currentStep.set(stepIndex);
  }

  protected goNextStep(): void {
    const step = this.currentStep();
    if (!this.isStepValid(step)) {
      this.markStepTouched(step);
      return;
    }
    this.currentStep.update((s) => Math.min(DashboardMockPlanningBriefPageComponent.stepFieldKeys.length - 1, s + 1));
  }

  protected goPrevStep(): void {
    this.currentStep.update((s) => Math.max(0, s - 1));
  }

  protected isLastStep(): boolean {
    return this.currentStep() === DashboardMockPlanningBriefPageComponent.stepFieldKeys.length - 1;
  }

  protected errorFor(controlName: keyof typeof this.form.controls): string {
    const control = this.form.controls[controlName];
    if (!control.errors) {
      return '';
    }
    if (control.errors['required']) {
      return 'Please fill this in so we can plan your first design previews.';
    }
    if (control.errors['minlength']) {
      const requested: number = control.errors['minlength'].requiredLength;
      return `A little more detail helps—try at least ${requested} characters.`;
    }
    return 'Please check this field.';
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const firstInvalidStep = DashboardMockPlanningBriefPageComponent.stepFieldKeys.findIndex((keys) =>
        keys.some((k) => {
          const c = this.form.get(k);
          return c !== null && c.invalid;
        }),
      );
      if (firstInvalidStep >= 0) {
        this.currentStep.set(firstInvalidStep);
      }
      return;
    }

    const token = this.auth.getStoredToken();
    if (!token) {
      this.errorMessage.set('You need to sign in again to send this.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const raw = this.form.getRawValue();
    const payload: MockPlanningBriefSubmitPayload = {
      projectName: raw.projectName,
      primaryGoal: raw.primaryGoal,
      audience: raw.audience,
      mustHavePages: raw.mustHavePages,
      brandNotes: raw.brandNotes,
      references: raw.references,
      deadline: raw.deadline,
    };

    try {
      await firstValueFrom(
        this.http.post<MockPlanningBriefCreatedResponse>('/api/client/mock-planning-brief', payload, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      this.submitted.set(true);
      this.form.disable();
      this.clearDraftStorage();
      void this.todos.fetchSummary();
    } catch (err: unknown) {
      this.errorMessage.set(this.resolveSubmitError(err));
    } finally {
      this.submitting.set(false);
    }
  }

  protected prepareAnother(): void {
    this.submitted.set(false);
    this.errorMessage.set('');
    this.form.enable();
    this.currentStep.set(0);
  }

  protected clearDraftWithConfirm(): void {
    if (!globalThis.confirm('Discard the saved draft on this device?')) {
      return;
    }
    this.clearDraftStorage();
    this.form.reset({
      projectName: '',
      primaryGoal: 'Launch a new site',
      audience: '',
      mustHavePages: '',
      brandNotes: '',
      references: '',
      deadline: 'Flexible',
    });
    this.currentStep.set(0);
  }

  protected printSummary(): void {
    const raw = this.form.getRawValue();
    const text = [
      'Design planning',
      '',
      `Project working title: ${raw.projectName}`,
      `Primary goal: ${raw.primaryGoal}`,
      `Who visits and what they should do: ${raw.audience}`,
      `Pages or sections to show in the first design previews: ${raw.mustHavePages}`,
      `Brand notes: ${raw.brandNotes || '—'}`,
      `Examples or references: ${raw.references || '—'}`,
      `Timing: ${raw.deadline}`,
    ].join('\n');
    const w = globalThis.open('', '_blank', 'noopener');
    if (!w) {
      return;
    }
    const doc = w.document;
    const pre = doc.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.fontFamily = 'system-ui, sans-serif';
    pre.style.padding = '24px';
    pre.textContent = text;
    doc.body.appendChild(pre);
    w.focus();
    w.print();
    w.close();
  }

  private restoreDraftIfPresent(): void {
    const user = this.auth.user();
    if (!user) {
      return;
    }
    const raw = localStorage.getItem(draftStorageKey(user.id));
    const parsed = raw ? parseDraftJson(raw) : null;
    if (!parsed) {
      return;
    }
    this.form.patchValue(parsed);
  }

  private persistDraft(): void {
    const user = this.auth.user();
    if (!user) {
      return;
    }
    localStorage.setItem(draftStorageKey(user.id), JSON.stringify(this.form.getRawValue()));
  }

  private clearDraftStorage(): void {
    const user = this.auth.user();
    if (!user) {
      return;
    }
    localStorage.removeItem(draftStorageKey(user.id));
  }

  private markStepTouched(stepIndex: number): void {
    for (const key of DashboardMockPlanningBriefPageComponent.stepFieldKeys[stepIndex]) {
      this.form.get(key)?.markAsTouched();
    }
  }

  private isStepValid(stepIndex: number): boolean {
    return DashboardMockPlanningBriefPageComponent.stepFieldKeys[stepIndex].every((key) => {
      const c = this.form.get(key);
      return c !== null && c.valid;
    });
  }

  private resolveSubmitError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      return messageFromMockBriefHttpError(err);
    }
    if (err instanceof Error && err.message.trim().length > 0) {
      return err.message;
    }
    return DashboardMockPlanningBriefPageComponent.submitFailureFallback;
  }
}
