import {useNavigate} from 'react-router';

import {useSignOut} from '@grov/hooks';

/** Signs out this session, clears the cache and goes to `to`. */
export function useSignOutAndLeave(to: string) {
  const navigate = useNavigate();
  const signOut = useSignOut();
  return {
    ...signOut,
    signOut: () => signOut.mutate(undefined, {onSettled: () => navigate(to, {replace: true})}),
  };
}
