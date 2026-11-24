import {Inbox} from 'lucide-react';

import {cn} from '@grov/ui';

import {useSupport} from './support-context';

/** Top-bar entry to support. The count = open conversations waiting on us (mine or unassigned). */
export function InboxButton({disabled}: {disabled?: boolean}) {
  const {mode, open, close, waitingCount} = useSupport();
  const isOpen = mode !== 'closed';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => (isOpen ? close() : open())}
      aria-pressed={isOpen}
      aria-label={waitingCount ? `Inbox, ${waitingCount} waiting` : 'Inbox'}
      className={cn(
        'relative flex h-10 items-center gap-2 rounded-pill border border-line bg-surface px-3 text-body-sm font-semibold text-ink transition-colors',
        'hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50',
        isOpen && 'border-ink bg-surface-sunken'
      )}
    >
      <Inbox aria-hidden className="size-4" />
      <span className="hidden md:inline">Inbox</span>
      {waitingCount ? (
        <span className="min-w-5 rounded-pill bg-flame px-1.5 text-center text-chip text-on-bright">
          {waitingCount}
        </span>
      ) : null}
    </button>
  );
}
