import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { map, tap } from 'rxjs/operators';

import { ApiClient } from '../api/api-client.service';
import { LoginRequest, LoginResponse, LoginResult, RegisterRequest } from './auth.models';
import { TokenStorage } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  private readonly tokenStorage = inject(TokenStorage);

  login(payload: LoginRequest) {
    return this.loginCustomer(payload).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return this.loginAdmin(payload);
        }
        return throwError(() => err);
      }),
      tap(result => {
        this.tokenStorage.setToken(result.token);
        this.tokenStorage.setScope(result.scope);
      })
    );
  }

  private loginCustomer(payload: LoginRequest) {
    return this.api.post<LoginResponse>('/customer/login', payload).pipe(
      mergeMap(res => this.toLoginResult('customer', res))
    );
  }

  private loginAdmin(payload: LoginRequest) {
    return this.api.post<LoginResponse>('/admin/login', payload).pipe(
      mergeMap(res => this.toLoginResult('admin', res))
    );
  }

  private toLoginResult(scope: 'admin' | 'customer', res: LoginResponse) {
    if (!res?.token) {
      return throwError(() => new Error('Missing login token in response.'));
    }
    return of<LoginResult>({
      scope,
      token: res.token,
      user: res.user ?? null
    });
  }

  register(payload: RegisterRequest) {
    return this.api.post<unknown>('/customer/register', payload).pipe(map(() => void 0));
  }

  logout() {
    const scope = this.tokenStorage.getScope();
    const logoutPath = scope === 'admin' ? '/admin/logout' : '/customer/logout';

    return this.api.post<unknown>(logoutPath).pipe(
      tap(() => this.tokenStorage.clear()),
      catchError(() => {
        this.tokenStorage.clear();
        return of(void 0);
      }),
      map(() => void 0)
    );
  }
}

