import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '@app/shared/services/auth.service';

/** After session restore, sends anonymous users to login; dashboard + children stay private. */
export const requireAuthGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.sessionReady;

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  return true;
};
