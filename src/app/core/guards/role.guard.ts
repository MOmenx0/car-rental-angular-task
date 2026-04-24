import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';

import { SessionService } from '../auth/session.service';

export function roleGuard(requiredRole: 'Admin' | 'Customer'): CanMatchFn {
  return () => {
    const session = inject(SessionService);
    const router = inject(Router);

    if (!session.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    const currentRole = session.role();
    if (currentRole) {
      if (currentRole === requiredRole) return true;
      return router.createUrlTree([session.homeRouteForRole(currentRole) ?? '/login']);
    }

    const currentScope = session.scope();
    if (requiredRole === 'Admin' && currentScope === 'admin') return true;
    if (requiredRole === 'Customer' && currentScope === 'customer') return true;

    // Ensure role is loaded when user refreshes.
    return session.loadMe().pipe(
      map(() => {
        const loadedRole = session.role();
        if (!loadedRole) {
          const scope = session.scope();
          if (requiredRole === 'Customer' && scope === 'customer') return true;
          if (requiredRole === 'Admin' && scope === 'admin') return true;
          if (scope === 'customer') return router.createUrlTree(['/cars']);
          if (scope === 'admin') return router.createUrlTree(['/admin/users']);

          session.clearSession();
          return router.createUrlTree(['/login']);
        }

        if (loadedRole === requiredRole) return true;
        return router.createUrlTree([session.homeRouteForRole(loadedRole) ?? '/login']);
      })
    );
  };
}

