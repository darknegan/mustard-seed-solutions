import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

interface ChangeExample {
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-dashboard-request-change-page',
  standalone: true,
  imports: [ButtonModule, ReactiveFormsModule],
  templateUrl: './dashboard-request-change-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardRequestChangePageComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);

  protected readonly form = this.fb.group({
    updateType: ['Text update', Validators.required],
    pageArea: ['', [Validators.required, Validators.minLength(2)]],
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
      return 'Please fill this in so we know what to update.';
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
