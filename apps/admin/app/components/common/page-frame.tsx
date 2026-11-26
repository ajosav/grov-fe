import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {createPortal} from 'react-dom';
import {NavLink} from 'react-router';

import {cn} from '@grov/ui';

/*
 * Layout (the Cloudflare R2 bucket page, measured at 1×):
 *
 *   ┌ top bar (shell, h-14, hairline under it) ───────────────────────────────┐
 *   │ strip: section tabs, same left edge as the top bar, hairline under it  │
 *   ├──────────────────────────────────────────────┬─────────────────────────┤
 *   │ body: 48px side gutter, 32px top             │ rail: 25rem, hairline   │
 *   │ (header, then the page)                      │ on its left, same       │
 *   │                                              │ canvas as the page,     │
 *   │                                              │ runs to the bottom      │
 *   └──────────────────────────────────────────────┴─────────────────────────┘
 *
 * One background everywhere (the canvas). Regions are split by 1px `line` hairlines only;
 * the rail is never a card, never a different fill, never a shadow. Only the content inside
 * the body (tables, panels) sits on white `surface`.
 */

/** Matches the shell's top bar padding, so the tabs start under the sidebar toggle. */
const STRIP_GUTTER = 'px-3 sm:px-6';
/** The body is set in further than the strip, like the reference (16px strip vs 48px body). */
const BODY_GUTTER = 'px-4 sm:px-6 @5xl:px-12';

interface FrameContext {
  slot: HTMLElement | null;
  register: (delta: number) => void;
}

const Frame = createContext<FrameContext | null>(null);

export interface PageFrameProps {
  /** Title row at the top of the body: `PageHeader`, a back link, an identity banner. */
  header?: ReactNode;
  /** Section tabs in the strip under the top bar; the hairline under them runs edge to edge. */
  tabs?: ReactNode;
  /** Keep the body readable on wide screens when there is no rail. */
  contain?: boolean;
  /**
   * Below 64rem the rail is hidden by default (its figures live on the Metrics tab). Set this
   * when the rail holds things people act on, so it stacks under the body instead.
   */
  stackRail?: boolean;
  children: ReactNode;
}

/**
 * A full-bleed page: an optional tab strip under the top bar, then the body with an optional
 * rail that runs from the strip's hairline to the bottom of the screen against the right edge.
 * Any page below can fill the rail with `<PageRail>`. The route must export `handle.fullBleed`.
 *
 * The rail only shows when the frame is at least 64rem wide. Below that it is hidden, not
 * stacked under the body: it holds summary figures that the page's Metrics tab (or the body
 * itself) already covers, so a phone or tablet goes straight to the list. Pages whose rail holds
 * actions pass `stackRail` to keep it, under the body.
 */
export function PageFrame({header, tabs, contain, stackRail, children}: PageFrameProps) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [rails, setRails] = useState(0);
  const register = useCallback((delta: number) => setRails(count => count + delta), []);
  const value = useMemo(() => ({slot, register}), [slot, register]);
  const hasRail = rails > 0;

  return (
    <Frame.Provider value={value}>
      <div className="@container flex flex-1 flex-col">
        {tabs ? (
          <div className={cn('flex min-h-14 items-center border-b border-line', STRIP_GUTTER)}>
            {tabs}
          </div>
        ) : null}
        <div
          className={cn(
            'grid flex-1 items-stretch',
            hasRail && '@5xl:grid-cols-[minmax(0,1fr)_21rem] @7xl:grid-cols-[minmax(0,1fr)_25rem]'
          )}
        >
          <div className={cn('min-w-0 pt-6 pb-10 @5xl:pt-8', BODY_GUTTER)}>
            <div className={cn('@container', contain && !hasRail && 'mx-auto max-w-7xl')}>
              {header}
              {children}
            </div>
          </div>
          <aside
            ref={setSlot}
            aria-label="Summary"
            className={cn(
              'hidden min-w-0 border-line @5xl:border-l',
              hasRail && (stackRail ? 'block border-t @5xl:border-t-0' : '@5xl:block')
            )}
          />
        </div>
      </div>
    </Frame.Provider>
  );
}

/** Puts its children in the frame's rail. Render it anywhere inside `PageFrame`. */
export function PageRail({children}: {children: ReactNode}) {
  const frame = useContext(Frame);
  const register = frame?.register;
  useEffect(() => {
    register?.(1);
    return () => register?.(-1);
  }, [register]);
  if (!frame?.slot) return null;
  return createPortal(
    <div className="@5xl:sticky @5xl:top-14 @5xl:max-h-[calc(100dvh-3.5rem)] @5xl:overflow-y-auto">
      {children}
    </div>,
    frame.slot
  );
}

/**
 * The strip's tab look, shared by route tabs (`SectionTabs`) and Radix tabs (`ProductTabNav`):
 * a sunken track with 8px corners, the active tab a white tile with a hairline.
 */
export const STRIP_TABS = {
  list: 'inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-sm bg-surface-sunken p-[3px]',
  tab: 'inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-[6px] border border-transparent px-3 text-body-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
  active: 'border-line bg-surface text-ink shadow-[0_1px_2px_rgb(0_0_0/0.04)]',
} as const;

export interface SectionTab {
  to: string;
  label: string;
  end?: boolean;
}

/** Route tabs for the strip under the top bar. */
export function SectionTabs({tabs, label}: {tabs: SectionTab[]; label: string}) {
  return (
    <nav aria-label={label} className="min-w-0">
      <ul className={STRIP_TABS.list}>
        {tabs.map(tab => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({isActive}) => cn(STRIP_TABS.tab, isActive && STRIP_TABS.active)}
            >
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
