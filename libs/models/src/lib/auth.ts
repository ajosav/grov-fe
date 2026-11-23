/** Which console a session belongs to. Separate cookies and sessions per audience. */
export const Audience = {
  APP: 'APP',
  ADMIN: 'ADMIN',
} as const;
export type Audience = (typeof Audience)[keyof typeof Audience];

/** Pending requirements on a signed-in session (`Me.gates`, `AuthResponse.nextStep`). */
export const Gate = {
  VERIFY_EMAIL: 'VERIFY_EMAIL',
  ADD_PHONE: 'ADD_PHONE',
  ACCEPT_TERMS: 'ACCEPT_TERMS',
  MFA: 'MFA',
  MFA_ENROL: 'MFA_ENROL',
} as const;
export type Gate = (typeof Gate)[keyof typeof Gate];

export const ThemePreference = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;
export type ThemePreference = (typeof ThemePreference)[keyof typeof ThemePreference];
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;
