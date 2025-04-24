import { CanActivateFn } from '@angular/router';

export const sellerAdminGuard: CanActivateFn = (route, state) => {
  return true;
};
