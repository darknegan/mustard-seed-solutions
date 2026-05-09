import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@app/shared/services/auth.service';

interface PortalBenefit {
  readonly id: string;
  readonly label: string;
}

interface AuthErrorMessageBody {
  readonly error: string;
}

interface AuthWrappedNestedErrorBody {
  readonly error: AuthErrorMessageBody;
}

function isAuthWrappedNestedErrorBody(value: object): value is AuthWrappedNestedErrorBody {
  if (!('error' in value)) {
    return false;
  }
  const inner = Reflect.get(value, 'error');
  if (typeof inner !== 'object' || inner === null || !('error' in inner)) {
    return false;
  }
  return typeof Reflect.get(inner, 'error') === 'string';
}

function isAuthErrorMessageBody(value: object): value is AuthErrorMessageBody {
  return typeof Reflect.get(value, 'error') === 'string';
}

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private static readonly authFailureFallback = 'Something went wrong. Please try again.';

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  protected readonly isSignup = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly benefits: readonly PortalBenefit[] = [
    { id: 'visibility', label: 'Real-time project visibility' },
    { id: 'team', label: 'Direct access to your team' },
    { id: 'care', label: 'Site care, visitor numbers, and updates' },
  ];

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
    } catch (err) {
      const message =
        err instanceof HttpErrorResponse || err instanceof Error
          ? this.resolveAuthFailure(err)
          : LoginPageComponent.authFailureFallback;
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
    } catch (err) {
      const message =
        err instanceof HttpErrorResponse || err instanceof Error
          ? this.resolveAuthFailure(err)
          : LoginPageComponent.authFailureFallback;
      this.errorMessage.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  private resolveAuthFailure(err: HttpErrorResponse | Error): string {
    if (err instanceof HttpErrorResponse) {
      return LoginPageComponent.messageFromHttpError(err);
    }
    if (err instanceof Error && err.message.trim().length > 0) {
      return err.message;
    }
    return LoginPageComponent.authFailureFallback;
  }

  private static messageFromHttpError(error: HttpErrorResponse): string {
    const body = error.error;
    if (typeof body === 'object' && body !== null) {
      if (isAuthWrappedNestedErrorBody(body)) {
        return body.error.error;
      }
      if (isAuthErrorMessageBody(body)) {
        return body.error;
      }
    }
    return LoginPageComponent.authFailureFallback;
  }
}
