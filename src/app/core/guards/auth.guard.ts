import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { TokenStorage } from '../auth/token-storage.service';

export const authGuard: CanMatchFn = () => {
  const token = inject(TokenStorage).getToken();
  if (token) return true;
  return inject(Router).createUrlTree(['/login']);
};

