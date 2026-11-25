import {useEffect, useState} from 'react';

import {Check, Inbox, MessagesSquare, Palette, Store} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router';

import {useMyStores, useSwitchStore} from '@grov/hooks';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  toast,
} from '@grov/ui';

import type {NavTrail} from '../../lib/shell/nav';
import {SIDEBAR_THEMES, useSidebarTheme} from '../../stores/sidebar-theme';
import {paths} from '../../paths';
import {useSupport} from '../support';

export interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trails: NavTrail[];
}

/** ⌘K / Ctrl+K: jump to any page you can open, or switch store. */
export function CommandMenu({open, onOpenChange, trails}: CommandMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const stores = useMyStores();
  const switchStore = useSwitchStore();
  const support = useSupport();
  const [search, setSearch] = useState('');
  const [sidebarTheme, setSidebarTheme] = useSidebarTheme();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const go = (to: string) => {
    onOpenChange(false);
    setSearch('');
    // Focus mode returns to the page it was opened from.
    navigate(to, {state: {from: location.pathname + location.search}});
  };

  const storeOptions = stores.data?.stores ?? [];

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search the console"
      description="Find a page or switch store"
    >
      <CommandInput
        placeholder="Search pages, conversations and stores"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Nothing matches that.</CommandEmpty>
        <CommandGroup heading="Support">
          <CommandItem
            value="support inbox open all conversations"
            onSelect={() => go(paths.support)}
          >
            <Inbox aria-hidden />
            <span className="flex-1">Open the support inbox</span>
          </CommandItem>
          {(search.trim() ? support.conversations : []).map(c => (
            <CommandItem
              key={c.id}
              value={`conversation ${c.number} ${c.customer.name} ${c.subject} ${c.orderNumber ?? ''}`}
              onSelect={() => {
                onOpenChange(false);
                support.open(c.id);
              }}
            >
              <MessagesSquare aria-hidden />
              <span className="flex-1 truncate">
                {c.customer.name} · {c.subject}
              </span>
              <span className="text-body-sm text-ink-muted">{c.number}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Pages">
          {trails.map(({page, sections}) => (
            <CommandItem
              key={page.to}
              value={`${sections.map(s => s.label).join(' ')} ${page.label} ${page.to}`}
              keywords={page.keywords}
              onSelect={() => go(page.to)}
            >
              <page.icon aria-hidden />
              <span className="flex-1 truncate">{page.label}</span>
              {sections.length ? (
                <span className="truncate text-body-sm text-ink-muted">
                  {sections.map(s => s.label).join(' › ')}
                </span>
              ) : null}
            </CommandItem>
          ))}
        </CommandGroup>
        {search.trim() ? (
          <CommandGroup heading="Sidebar theme">
            {SIDEBAR_THEMES.map(t => (
              <CommandItem
                key={t.id}
                value={`sidebar theme colour ${t.name} ${t.note}`}
                onSelect={() => {
                  setSidebarTheme(t.id);
                  onOpenChange(false);
                }}
              >
                <Palette aria-hidden />
                <span className="flex-1">Sidebar theme: {t.name}</span>
                {t.id === sidebarTheme ? <Check aria-label="Current theme" /> : null}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        {storeOptions.length > 1 ? (
          <CommandGroup heading="Switch store">
            {storeOptions.map(store => (
              <CommandItem
                key={store.id}
                value={`store ${store.name}`}
                disabled={store.status !== 'ACTIVE' || switchStore.isPending}
                onSelect={() => {
                  onOpenChange(false);
                  if (store.id === stores.data?.activeStoreId) return;
                  switchStore.mutate(store.id, {
                    onSuccess: () => toast.success(`Now working in ${store.name}`),
                  });
                }}
              >
                <Store aria-hidden />
                <span className="flex-1 truncate">{store.name}</span>
                {store.id === stores.data?.activeStoreId ? (
                  <Check aria-label="Current store" />
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
