import {ClipboardList, House, PiggyBank, Sparkles, Store} from 'lucide-react';

import {AppShell, type NavItem, RequireAuth, UserMenu} from '@grov/shared';

import {paths} from '../paths';

const NAV: NavItem[] = [
  {to: paths.home, label: 'Home', icon: House, end: true},
  {to: paths.shop, label: 'Shop', icon: Store},
  {to: paths.plan, label: 'Plan', icon: Sparkles, center: true},
  {to: paths.orders, label: 'Orders', icon: ClipboardList},
  {to: paths.savings, label: 'Savings', icon: PiggyBank},
];

export default function AppLayout() {
  return (
    <RequireAuth signInPath={paths.signIn} gatesPath={paths.finishAccount}>
      <AppShell
        nav={NAV}
        mobileNav="bottom"
        headerEnd={<UserMenu signedOutPath={paths.signIn} accountPath={paths.account} />}
      />
    </RequireAuth>
  );
}
