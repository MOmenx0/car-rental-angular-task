import { Injectable, computed, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ApiClient } from '../api/api-client.service';
import { AuthScope, AuthUser, RawAuthUser, UserRole } from './auth.models';
import { TokenStorage } from './token-storage.service';

const AUTH_USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly api = inject(ApiClient);
  private readonly tokenStorage = inject(TokenStorage);

  private readonly userSig = signal<AuthUser | null>(null);
  readonly user = this.userSig.asReadonly();

  readonly isAuthenticated = computed(() => !!this.tokenStorage.token());
  readonly scope = computed<AuthScope | null>(() => this.tokenStorage.scope());
  readonly role = computed<UserRole | null>(() => this.userSig()?.role ?? null);

  constructor() {
    this.restoreFromStorage();
  }

  homeRouteForRole(role: UserRole | null) {
    if (role === 'Admin') return '/admin/users';
    if (role === 'Customer') return '/cars';
    return null;
  }

  setUserFromLogin(rawUser: RawAuthUser | null | undefined) {
    const normalized = this.normalizeUser(rawUser);
    this.userSig.set(normalized);

    if (normalized) {
      this.persistUser(normalized);
      return;
    }

    this.clearStoredUser();
  }

  loadMe() {
    if (!this.tokenStorage.getToken()) {
      this.clearStoredUser();
      this.userSig.set(null);
      return of(void 0);
    }

    // Admin API has no stable /admin/me endpoint; avoid calling customer/me with admin token.
    if (this.scope() === 'admin' || this.role() === 'Admin') {
      return of(void 0);
    }

    return this.api.get<RawAuthUser>('/customer/me').pipe(
      tap(user => {
        const normalized = this.normalizeUser(user);
        this.userSig.set(normalized);
        if (normalized) this.persistUser(normalized);
      }),
      map(() => void 0),
      catchError(() => {
        this.clearSession();
        return of(void 0);
      })
    );
  }

  clearSession() {
    this.userSig.set(null);
    this.clearStoredUser();
    this.tokenStorage.clear();
  }

  private normalizeUser(raw: RawAuthUser | null | undefined): AuthUser | null {
    if (!raw || typeof raw.email !== 'string') return null;

    const role = this.normalizeRole(raw.role);
    if (!role) return null;

    const id = typeof raw.id === 'number' ? raw.id : Number(raw.id ?? 0);

    return {
      id: Number.isFinite(id) ? id : 0,
      email: raw.email,
      role,
      name: typeof raw.name === 'string' ? raw.name : undefined,
      country: typeof raw.country === 'string' ? raw.country : undefined
    };
  }

  private normalizeRole(role: unknown): UserRole | null {
    if (typeof role !== 'string') return null;

    const normalized = role.trim().toLowerCase();
    if (normalized === 'admin') return 'Admin';
    if (normalized === 'customer') return 'Customer';
    return null;
  }

  private persistUser(user: AuthUser) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  private clearStoredUser() {
    localStorage.removeItem(AUTH_USER_KEY);
  }

  private restoreFromStorage() {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as AuthUser;
      const restored = this.normalizeUser(parsed as unknown as RawAuthUser);
      this.userSig.set(restored);
      if (!restored) this.clearStoredUser();
    } catch {
      this.clearStoredUser();
    }
  }
}

