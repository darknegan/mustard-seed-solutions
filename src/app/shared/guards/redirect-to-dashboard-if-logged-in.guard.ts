import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '@app/shared/services/auth.service';

/** After session is restored, sends logged-in users to the client dashboard instead of marketing or login. */
export const redirectToDashboardIfLoggedInGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.sessionReady;

  if (auth.isLoggedIn()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
