import type {OtpChallengeSummary} from '@grov/models';

import {createStore} from './create-store';

/**
 * State carried between the email, code and profile screens of the passwordless
 * sign-in. The email is kept for this tab (a reload keeps you on the code
 * screen); the registration ticket stays in memory only.
 */
interface SignInState {
  email: string | null;
  challenge: OtpChallengeSummary | null;
  /** Single-use ticket from `code/verify` for a new account; finishes the profile. */
  registration: {ticket: string; expiresAt: string} | null;
  /** Where to go after signing in (the page that sent them to sign-in). */
  redirectTo: string | null;
  start: (email: string, challenge: OtpChallengeSummary, redirectTo?: string | null) => void;
  setChallenge: (challenge: OtpChallengeSummary) => void;
  setRegistration: (registration: {ticket: string; expiresAt: string} | null) => void;
  reset: () => void;
}

const initial = {email: null, challenge: null, registration: null, redirectTo: null};

export const useSignInStore = createStore<SignInState>(
  set => ({
    ...initial,
    start: (email, challenge, redirectTo = null) =>
      set({email, challenge, registration: null, redirectTo}),
    setChallenge: challenge => set({challenge}),
    setRegistration: registration => set({registration}),
    reset: () => set(initial),
  }),
  {
    persist: {
      storage: 'session',
      key: 'sign-in',
      partialize: ({email, challenge, redirectTo}) => ({email, challenge, redirectTo}),
    },
  }
);
