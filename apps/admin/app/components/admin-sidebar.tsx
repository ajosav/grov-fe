import {type MouseEvent, useEffect, useRef, useState} from 'react';

import {ChevronLeft, ChevronRight, Palette} from 'lucide-react';
import {Link, NavLink, useLocation} from 'react-router';

import {cn, Popover, PopoverContent, PopoverTrigger} from '@grov/ui';

import {
  activeTrail,
  firstPage,
  flattenNav,
  type NavEntry,
  type NavGroup,
  type NavPage,
  type NavSection,
} from '../lib/nav';
import {SidebarThemePicker} from './sidebar-theme-picker';
import {StoreMenu} from './store-menu';

export interface AdminSidebarProps {
  groups: NavGroup[];
  footer: NavPage[];
  onNavigate?: () => void;
  className?: string;
}

const rowBase =
  'flex min-h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-body text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus pointer-coarse:min-h-11';
const rowActive = 'bg-surface-sunken font-semibold text-ink [&>svg:first-child]:text-flame-strong';

export function AdminSidebar({groups, footer, onNavigate, className}: AdminSidebarProps) {
  const {pathname} = useLocation();
  const roots = groups.flatMap(g => g.entries);
  const active = activeTrail(flattenNav([...roots, ...footer]), pathname);
  const activeStack = active?.sections.map(s => s.id) ?? [];

  const [override, setOverride] = useState<{pathname: string; stack: string[]} | null>(null);
  const stack = override?.pathname === pathname ? override.stack : activeStack;
  const panels = resolvePanels(roots, stack);
  const panel = panels.at(-1);

  const depthRef = useRef(panels.length);
  const direction = panels.length >= depthRef.current ? 'forward' : 'back';
  useEffect(() => {
    depthRef.current = panels.length;
  }, [panels.length]);

  const isActiveSection = (s: NavSection) => active?.sections.some(a => a.id === s.id) ?? false;

  const openSection = (event: MouseEvent, s: NavSection) => {
    if (isActiveSection(s)) {
      // Already on a page inside: open the panel, stay on the page.
      event.preventDefault();
      setOverride({pathname, stack: [...panels.map(p => p.id), s.id]});
    } else {
      setOverride(null);
      onNavigate?.();
    }
  };

  const renderEntry = (entry: NavEntry) =>
    entry.kind === 'page' ? (
      <li key={entry.to}>
        <PageLink page={entry} onNavigate={onNavigate} />
      </li>
    ) : (
      <li key={entry.id}>
        <Link
          to={firstPage(entry)?.to ?? '#'}
          onClick={event => openSection(event, entry)}
          className={cn(rowBase, isActiveSection(entry) && 'font-semibold text-ink')}
        >
          <entry.icon aria-hidden className="size-4 shrink-0" />
          <span className="flex-1 truncate">{entry.label}</span>
          <ChevronRight aria-hidden className="size-3.5 shrink-0 text-ink-muted" />
        </Link>
      </li>
    );

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div className="p-2">
        <StoreMenu />
      </div>

      <nav aria-label="Main" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4">
        <div
          key={panel?.id ?? 'root'}
          className={cn(direction === 'forward' ? 'admin-slide-in-forward' : 'admin-slide-in-back')}
        >
          {panel ? (
            <>
              <div className="sticky top-0 z-10 mb-1 grid grid-cols-[2rem_1fr_2rem] items-center bg-sidebar py-1.5">
                <button
                  type="button"
                  onClick={() => setOverride({pathname, stack: stack.slice(0, -1)})}
                  aria-label={`Back to ${panels.at(-2)?.label ?? 'main menu'}`}
                  className="flex size-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <ChevronLeft aria-hidden className="size-4" />
                </button>
                <h2 className="truncate text-center text-body font-medium text-ink-muted">
                  {panel.label}
                </h2>
              </div>
              <ul className="grid gap-0.5">{panel.children.map(renderEntry)}</ul>
            </>
          ) : (
            <div className="grid gap-5 pt-1">
              {groups.map((group, i) => (
                <section key={group.label ?? i} aria-label={group.label}>
                  {group.label ? (
                    <h2 className="px-2.5 pb-1 text-body-sm text-ink-muted">{group.label}</h2>
                  ) : null}
                  <ul className="grid gap-0.5">{group.entries.map(renderEntry)}</ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="flex items-center gap-1 border-t border-line p-2">
        <ul className="grid min-w-0 flex-1 gap-0.5">
          {footer.map(p => (
            <li key={p.to}>
              <PageLink page={p} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
        <Popover>
          <PopoverTrigger
            aria-label="Sidebar theme"
            title="Sidebar theme"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus pointer-coarse:size-11"
          >
            <Palette aria-hidden className="size-4" />
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-80 p-3">
            <p className="pb-2 text-label">Sidebar theme</p>
            <SidebarThemePicker compact />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function PageLink({page, onNavigate}: {page: NavPage; onNavigate?: () => void}) {
  return (
    <NavLink
      to={page.to}
      end={page.end}
      onClick={onNavigate}
      className={({isActive}) => cn(rowBase, isActive && rowActive)}
    >
      <page.icon aria-hidden className="size-4 shrink-0" />
      <span className="truncate">{page.label}</span>
    </NavLink>
  );
}

/** The chain of open sections for a stack of ids; stops at the first id that no longer exists. */
function resolvePanels(roots: NavEntry[], stack: string[]): NavSection[] {
  const panels: NavSection[] = [];
  let entries = roots;
  for (const id of stack) {
    const next = entries.find((e): e is NavSection => e.kind === 'section' && e.id === id);
    if (!next) break;
    panels.push(next);
    entries = next.children;
  }
  return panels;
}
