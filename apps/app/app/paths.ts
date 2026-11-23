/** Every in-app URL in one place, so links and guards never drift apart. */
export const paths = {
  home: '/',
  signIn: '/sign-in',
  signInCode: '/sign-in/code',
  signInProfile: '/sign-in/profile',
  finishAccount: '/finish-account',
  account: '/account',
} as const;
