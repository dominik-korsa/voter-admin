import { inject, InjectionKey } from 'vue';
import { CurrentUser } from 'src/api/types';

export interface UserManager {
  user: Readonly<CurrentUser> | null,
  replaceUser: (user: CurrentUser | null) => void;
}

export const userManagerInjectionKey = Symbol('User manager injection') as InjectionKey<Readonly<UserManager>>;

export const useUserManager = () => {
  const userManager = inject(userManagerInjectionKey);
  if (!userManager) throw new Error('Cannot inject user manager');
  return userManager;
};
