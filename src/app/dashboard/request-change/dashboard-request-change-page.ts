import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface ChangeExample {
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-dashboard-request-change-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dashboard-request-change-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardRequestChangePageComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly submitted = signal(false);

  protected readonly form = this.fb.group({
    updateType: ['Text update', Validators.required],
    pageArea: ['', Validators.required],
    details: ['', [Validators.required, Validators.minLength(12)]],
    timing: ['This week', Validators.required],
  });

  protected readonly examples: readonly ChangeExample[] = [
    {
      title: 'Text or photo updates',
      description: 'Swap team photos, edit a bio, or update event details.',
    },
    {
      title: 'New page content',
      description: 'Add a new service, announcement, or customer story.',
    },
    {
      title: 'Small layout changes',
      description: 'Move a section, rename a button, or adjust a callout.',
    },
  ];

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.set(true);
  }
}
