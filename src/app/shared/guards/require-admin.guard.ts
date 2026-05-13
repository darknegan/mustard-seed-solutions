import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '@app/shared/services/auth.service';

export const requireAdminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.sessionReady;

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.user()?.role !== 'admin') {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
