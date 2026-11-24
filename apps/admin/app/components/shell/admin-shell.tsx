import {type ReactNode, useMemo, useState} from 'react';

import {ChevronRight, Menu, PanelLeft, Search} from 'lucide-react';
import {Link, useLocation} from 'react-router';

import {useMediaQuery} from '@grov/hooks';
import {usePermissions, UserMenu} from '@grov/shared';
import {Button, cn, Dialog, DialogContent, DialogTitle, Kbd} from '@grov/ui';

import {activeTrail, firstPage, flattenNav, type NavTrail, visibleNav} from '../../lib/shell/nav';
import {sidebarThemeProps, useSidebarTheme} from '../../stores/sidebar-theme';
import {paths} from '../../paths';
import {AdminSidebar} from './admin-sidebar';
import {CommandMenu} from './command-menu';
import {InboxButton, SupportPanel, SupportProvider, useSupport} from '../support';

/**
 * Admin console frame. Desktop: sidebar (store menu, drill-in nav, settings)
 * that can be hidden, top bar with breadcrumbs, ⌘K search and the user menu.
 * Phones and tablets: the same sidebar in a left sheet.
 */
export function AdminShell({children}: {children: ReactNode}) {
  return (
    <SupportProvider>
      <Frame>{children}</Frame>
    </SupportProvider>
  );
}

function Frame({children}: {children: ReactNode}) {
  const {check} = usePermissions();
  const support = useSupport();
  const [sidebarTheme] = useSidebarTheme();
  const themeProps = sidebarThemeProps(sidebarTheme);
  const wide = useMediaQuery('(min-width: 80rem)');
  const {pathname} = useLocation();
  const {groups, footer} = useMemo(() => visibleNav(check), [check]);
  const trails = useMemo(
    () => flattenNav([...groups.flatMap(g => g.entries), ...footer]),
    [groups, footer]
  );
  const trail = activeTrail(trails, pathname);
  const onSupportPage = pathname === paths.support;
  // Docked = a third column from xl; narrower screens show the same panel as a sheet.
  const docked = support.mode === 'docked' && wide && !onSupportPage;
  const sheet = !onSupportPage && (support.mode === 'peek' || (support.mode === 'docked' && !wide));

  const [collapsed, setCollapsed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div
      className={cn(
        'min-h-dvh bg-canvas lg:grid',
        collapsed ? 'lg:grid-cols-[minmax(0,1fr)]' : 'lg:grid-cols-[15rem_minmax(0,1fr)]',
        docked &&
          (collapsed
            ? 'xl:grid-cols-[minmax(0,1fr)_24rem]'
            : 'xl:grid-cols-[15rem_minmax(0,1fr)_24rem]')
      )}
    >
      <aside
        {...themeProps}
        className={cn(
          'sticky top-0 hidden h-dvh border-r border-line bg-sidebar',
          !collapsed && 'lg:block'
        )}
      >
        <AdminSidebar groups={groups} footer={footer} />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header
          {...themeProps}
          className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-canvas/85 px-3 backdrop-blur sm:px-6"
        >
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setSheetOpen(true)}
          >
            <Menu aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
            aria-pressed={!collapsed}
            onClick={() => setCollapsed(c => !c)}
          >
            <PanelLeft aria-hidden />
          </Button>

          <Breadcrumbs trail={trail} fallback={onSupportPage ? 'Support' : undefined} />

          <div className="ml-auto flex items-center gap-2">
            <InboxButton disabled={onSupportPage} />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              aria-keyshortcuts="Meta+K Control+K"
              className="flex h-9 items-center gap-2 rounded-pill border border-line bg-surface px-3 text-body-sm text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:w-60"
            >
              <Search aria-hidden className="size-4" />
              <span className="hidden flex-1 text-left sm:inline">Search</span>
              <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
            </button>
            <UserMenu signedOutPath={paths.signIn} />
          </div>
        </header>

        <main
          key={pathname}
          className={cn(
            'mx-auto w-full flex-1',
            onSupportPage ? 'max-w-none' : 'max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8'
          )}
        >
          {children}
        </main>
      </div>

      {docked ? (
        <aside
          aria-label="Support inbox"
          className="sticky top-0 hidden h-dvh border-l border-line xl:block"
        >
          <SupportPanel canDock />
        </aside>
      ) : null}

      <Dialog open={sheet} onOpenChange={open => (open ? undefined : support.close())}>
        <DialogContent layout="side" hideClose className="max-w-[24rem] gap-0 p-0">
          <DialogTitle className="sr-only">Support inbox</DialogTitle>
          <SupportPanel canDock={wide} />
        </DialogContent>
      </Dialog>

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent
          layout="side"
          {...themeProps}
          className="left-0 right-auto max-w-xs gap-0 bg-sidebar p-0 sm:rounded-l-none sm:rounded-r-lg"
          hideClose
        >
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <AdminSidebar groups={groups} footer={footer} onNavigate={() => setSheetOpen(false)} />
        </DialogContent>
      </Dialog>

      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} trails={trails} />
    </div>
  );
}

function Breadcrumbs({trail, fallback}: {trail?: NavTrail; fallback?: string}) {
  if (!trail) {
    return fallback ? (
      <span className="truncate text-body-sm font-semibold text-ink">{fallback}</span>
    ) : null;
  }
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-body-sm">
        {trail.sections.map(section => (
          <li key={section.id} className="hidden items-center gap-1.5 sm:flex">
            <Link
              to={firstPage(section)?.to ?? '#'}
              className="truncate text-ink-muted hover:text-ink"
            >
              {section.label}
            </Link>
            <ChevronRight aria-hidden className="size-4 text-ink-muted" />
          </li>
        ))}
        <li className="truncate font-semibold text-ink" aria-current="page">
          {trail.page.label}
        </li>
      </ol>
    </nav>
  );
}
