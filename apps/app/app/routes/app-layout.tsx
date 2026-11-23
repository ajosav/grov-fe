import {House, UserRound} from 'lucide-react';

import {AppShell, type NavItem, RequireAuth, UserMenu} from '@grov/shared';

import {paths} from '../paths';

/** Only screens that exist are in the nav. Shop · Plan · Orders · Savings join as they are built (IA6). */
const NAV: NavItem[] = [
  {to: paths.home, label: 'Home', icon: House, end: true},
  {to: paths.account, label: 'Account', icon: UserRound},
];

export default function AppLayout() {
  return (
    <RequireAuth signInPath={paths.signIn} gatesPath={paths.finishAccount}>
      <AppShell nav={NAV} headerEnd={<UserMenu signedOutPath={paths.signIn} />} />
    </RequireAuth>
  );
}
