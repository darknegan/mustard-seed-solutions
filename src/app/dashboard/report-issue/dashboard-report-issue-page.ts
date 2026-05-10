import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

interface IssueTip {
  readonly label: string;
  readonly description: string;
}

@Component({
  selector: 'app-dashboard-report-issue-page',
  standalone: true,
  imports: [ButtonModule, ReactiveFormsModule],
  templateUrl: './dashboard-report-issue-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardReportIssuePageComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);

  protected readonly form = this.fb.group({
    pageUrl: ['', [Validators.required, Validators.minLength(2)]],
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

  protected isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  protected errorFor(controlName: keyof typeof this.form.controls): string {
    const control = this.form.controls[controlName];
    if (!control.errors) {
      return '';
    }
    if (control.errors['required']) {
      return 'Please fill this in so we can look into it.';
    }
    if (control.errors['minlength']) {
      const requested: number = control.errors['minlength'].requiredLength;
      return `A little more detail helps—try at least ${requested} characters.`;
    }
    return 'Please check this field.';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      this.submitted.set(true);
    }, 600);
  }
}
