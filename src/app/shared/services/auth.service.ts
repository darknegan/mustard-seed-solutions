import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly companyName: string;
  readonly role: string;
}

interface AuthResponse {
  readonly token: string;
  readonly user: AuthUser;
}

interface MeResponse {
  readonly user: AuthUser;
}

const TOKEN_KEY = 'mss_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user = signal<AuthUser | null>(null);

  private resolveSessionReady!: () => void;

  /** Resolves after stored token (if any) has been validated or cleared. Route guards should await this before trusting `isLoggedIn`. */
  readonly sessionReady: Promise<void> = new Promise<void>((resolve) => {
    this.resolveSessionReady = resolve;
  });

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  constructor() {
    const token = this.getStoredToken();
    if (token) {
      void this.loadCurrentUser().finally(() => {
        this.resolveSessionReady();
      });
    } else {
      this.resolveSessionReady();
    }
  }

  async signup(body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    phone?: string;
  }): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/signup', body),
    );
    this.storeToken(response.token);
    this._user.set(response.user);
  }

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/login', { email, password }),
    );
    this.storeToken(response.token);
    this._user.set(response.user);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
    void this.router.navigate(['/']);
  }

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      const token = this.getStoredToken();
      const response = await firstValueFrom(
        this.http.get<MeResponse>('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      this._user.set(response.user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      this._user.set(null);
    }
  }
}
