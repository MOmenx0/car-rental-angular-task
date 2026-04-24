import { Injectable, computed, signal } from '@angular/core';
import { AuthScope } from './auth.models';

const TOKEN_KEY = 'auth_token';
const AUTH_SCOPE_KEY = 'auth_scope';

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  private readonly tokenSig = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly scopeSig = signal<AuthScope | null>(this.readScopeFromStorage());

  readonly token = computed(() => this.tokenSig());
  readonly scope = computed(() => this.scopeSig());

  getToken(): string | null {
    return this.tokenSig();
  }

  setToken(token: string) {
    this.tokenSig.set(token);
    localStorage.setItem(TOKEN_KEY, token);
  }

  getScope(): AuthScope | null {
    return this.scopeSig();
  }

  setScope(scope: AuthScope) {
    this.scopeSig.set(scope);
    localStorage.setItem(AUTH_SCOPE_KEY, scope);
  }

  clear() {
    this.tokenSig.set(null);
    this.scopeSig.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_SCOPE_KEY);
  }

  private readScopeFromStorage(): AuthScope | null {
    const scope = localStorage.getItem(AUTH_SCOPE_KEY);
    if (scope === 'admin' || scope === 'customer') return scope;
    return null;
  }
}

