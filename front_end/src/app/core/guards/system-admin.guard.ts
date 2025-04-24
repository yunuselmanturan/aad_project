import { CanActivateFn } from '@angular/router';

export const systemAdminGuard: CanActivateFn = (route, state) => {
  return true;
};
