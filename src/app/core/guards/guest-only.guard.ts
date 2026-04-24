import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';

import { SessionService } from '../auth/session.service';
import { TokenStorage } from '../auth/token-storage.service';

export const guestOnlyGuard: CanMatchFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  const token = inject(TokenStorage).getToken();

  if (!token) return true;

  const knownHome = session.homeRouteForRole(session.role());
  if (knownHome) return router.createUrlTree([knownHome]);

  return session.loadMe().pipe(
    map(() => {
      const home = session.homeRouteForRole(session.role());
      if (home) return router.createUrlTree([home]);

      const scope = session.scope();
      if (scope === 'customer') return router.createUrlTree(['/cars']);
      if (scope === 'admin') return router.createUrlTree(['/admin/users']);

      // Token exists but profile role is unusable; allow visiting login again.
      session.clearSession();
      return true;
    })
  );
};

