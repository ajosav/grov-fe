import {type KeyboardEvent} from 'react';

import {Check} from 'lucide-react';

import {cn} from '@grov/ui';

import {SIDEBAR_THEMES, sidebarThemeProps, useSidebarTheme} from '../lib/sidebar-theme';

/**
 * Swatches that preview each sidebar theme in miniature. Arrow keys move the
 * choice (radio group). `compact` = the popover in the sidebar footer.
 */
export function SidebarThemePicker({compact, className}: {compact?: boolean; className?: string}) {
  const [theme, setTheme] = useSidebarTheme();

  const move = (event: KeyboardEvent, index: number) => {
    const step = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[event.key];
    if (!step) return;
    event.preventDefault();
    const next = SIDEBAR_THEMES.at((index + step) % SIDEBAR_THEMES.length);
    if (next) setTheme(next.id);
    const buttons =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons?.item((index + step + SIDEBAR_THEMES.length) % SIDEBAR_THEMES.length).focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Sidebar theme"
      className={cn(
        'grid gap-2',
        compact ? 'grid-cols-4' : 'grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3',
        className
      )}
    >
      {SIDEBAR_THEMES.map((option, index) => {
        const checked = option.id === theme;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`${option.name}: ${option.note}`}
            tabIndex={checked ? 0 : -1}
            onClick={() => setTheme(option.id)}
            onKeyDown={event => move(event, index)}
            className="group grid content-start gap-1.5 rounded-md text-left focus-visible:outline-none"
          >
            <span
              {...sidebarThemeProps(option.id)}
              className={cn(
                'relative grid gap-1 rounded-md border border-line bg-sidebar p-1.5 transition-shadow',
                compact ? 'h-14' : 'h-20 p-2',
                'group-focus-visible:ring-2 group-focus-visible:ring-focus',
                checked && 'ring-2 ring-ink ring-offset-2 ring-offset-surface-raised'
              )}
            >
              <span className="h-2 w-3/4 rounded-sm bg-ink/70" />
              <span className="flex h-2.5 items-center gap-1 rounded-sm bg-surface-sunken px-0.5">
                <span className="size-1.5 rounded-pill bg-flame-strong" />
                <span className="h-1 w-1/2 rounded-sm bg-ink/70" />
              </span>
              <span className="h-1.5 w-2/3 rounded-sm bg-ink-muted/50" />
              {compact ? null : <span className="h-1.5 w-1/2 rounded-sm bg-ink-muted/50" />}
              {checked ? (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-pill bg-ink text-canvas">
                  <Check aria-hidden className="size-3" />
                </span>
              ) : null}
            </span>
            <span
              className={cn('text-body-sm', checked ? 'font-semibold text-ink' : 'text-ink-muted')}
            >
              {option.name}
            </span>
            {compact ? null : (
              <span className="-mt-1 text-chip font-normal text-ink-muted">{option.note}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
