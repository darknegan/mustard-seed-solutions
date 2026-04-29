import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/shared/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  protected readonly isSignup = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected readonly signupForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    companyName: [''],
    phone: [''],
  });

  protected toggleMode(): void {
    this.isSignup.update((v) => !v);
    this.errorMessage.set('');
  }

  protected async submitLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { email, password } = this.loginForm.getRawValue();
      await this.auth.login(email, password);
      void this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      const message =
        err instanceof Object && 'error' in err
          ? (err as { error: { error: string } }).error.error
          : 'Something went wrong. Please try again.';
      this.errorMessage.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  protected async submitSignup(): Promise<void> {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await this.auth.signup(this.signupForm.getRawValue());
      void this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      const message =
        err instanceof Object && 'error' in err
          ? (err as { error: { error: string } }).error.error
          : 'Something went wrong. Please try again.';
      this.errorMessage.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
