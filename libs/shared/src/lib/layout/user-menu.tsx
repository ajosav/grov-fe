import {LogOut, Monitor, Moon, Sun} from 'lucide-react';

import {useMe} from '@grov/hooks';
import {ThemePreference} from '@grov/models';
import {
  Avatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  useTheme,
} from '@grov/ui';

import {useSignOutAndLeave} from '../auth/sign-out';

export interface UserMenuProps {
  /** Where to go after signing out. */
  signedOutPath: string;
}

export function UserMenu({signedOutPath}: UserMenuProps) {
  const {data: me} = useMe();
  const {preference, setPreference} = useTheme();
  const {signOut, isPending} = useSignOutAndLeave(signedOutPath);
  if (!me) return null;
  const name = [me.firstName, me.lastName].filter(Boolean).join(' ');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-pill p-1 pr-3 hover:bg-surface-sunken"
        aria-label="Account menu"
      >
        <Avatar name={me.firstName} className="size-9" />
        <span className="hidden text-body-sm font-semibold sm:inline">{me.firstName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <span className="block font-semibold text-ink">{name}</span>
          <span className="block truncate">{me.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={value => setPreference(value as ThemePreference)}
        >
          <DropdownMenuRadioItem value={ThemePreference.LIGHT}>
            <Sun aria-hidden className="mr-2 size-4" /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={ThemePreference.SYSTEM}>
            <Monitor aria-hidden className="mr-2 size-4" /> Device
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={ThemePreference.DARK}>
            <Moon aria-hidden className="mr-2 size-4" /> Dark
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isPending} onSelect={signOut}>
          <LogOut aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
