import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface IssueTip {
  readonly label: string;
  readonly description: string;
}

@Component({
  selector: 'app-dashboard-report-issue-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dashboard-report-issue-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardReportIssuePageComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly submitted = signal(false);

  protected readonly form = this.fb.group({
    pageUrl: ['', Validators.required],
    issueType: ['Something looks wrong', Validators.required],
    device: ['Desktop computer', Validators.required],
    details: ['', [Validators.required, Validators.minLength(12)]],
  });

  protected readonly tips: readonly IssueTip[] = [
    {
      label: 'Where you saw it',
      description: 'A page name or link helps us find the problem quickly.',
    },
    {
      label: 'What you expected',
      description: 'Tell us what should have happened instead.',
    },
    {
      label: 'What you were using',
      description: 'Phone, tablet, or computer details help us test the same way.',
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
