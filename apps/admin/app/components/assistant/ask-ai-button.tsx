import {Sparkles} from 'lucide-react';

import {cn} from '@grov/ui';

import {useAssistant} from './assistant-context';

/** Top-bar entry to the assistant panel. */
export function AskAiButton({disabled}: {disabled?: boolean}) {
  const {open, toggle} = useAssistant();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={toggle}
      aria-pressed={open}
      className={cn(
        'flex h-10 items-center gap-2 rounded-pill border border-line bg-surface px-3 text-body-sm font-semibold text-ink transition-colors',
        'hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50',
        open && 'border-ink bg-surface-sunken'
      )}
    >
      <Sparkles aria-hidden className="size-4 text-flame" />
      <span className="hidden md:inline">Ask AI</span>
      <span className="sr-only md:hidden">Ask AI</span>
    </button>
  );
}
