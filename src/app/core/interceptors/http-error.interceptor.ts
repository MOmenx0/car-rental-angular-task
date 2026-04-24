import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { SessionService } from '../auth/session.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const isAuthRequest =
    req.url.includes('/customer/login') ||
    req.url.includes('/admin/login') ||
    req.url.includes('/customer/register') ||
    req.url.includes('/admin/logout') ||
    req.url.includes('/customer/logout');

  return next(req).pipe(
    // Handle flaky network behavior without bothering users.
    retry({
      count: req.method === 'GET' ? 1 : 0,
      delay: err => {
        if (err instanceof HttpErrorResponse && (err.status === 0 || err.status >= 500)) {
          return timer(250);
        }
        return throwError(() => err);
      }
    }),
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        // Do not interfere with login flow fallback (customer -> admin login).
        if (!isAuthRequest) {
          session.clearSession();
          router.navigateByUrl('/login');
        }
      }
      return throwError(() => err);
    })
  );
};

