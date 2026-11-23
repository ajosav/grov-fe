import {useState} from 'react';

import {Check, Copy} from 'lucide-react';

import {cn} from '../utils/cn';
import {toast} from './toaster';

export interface CopyableTextProps {
  /** What is copied (an account number, a reference). */
  value: string;
  /** What is shown, if different (a formatted version). */
  display?: string;
  /** Names the thing for the button and toast ("account number"). */
  label: string;
  className?: string;
}

/** Text with a copy button (the Food balance account number, order references). */
export function CopyableText({value, display, label, className}: CopyableTextProps) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`Copied ${label}`);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(`Couldn’t copy. Select the ${label} and copy it.`);
    }
  };
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="tabular select-all font-semibold">{display ?? value}</span>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={`Copy ${label}`}
        className="flex size-9 items-center justify-center rounded-pill text-ink-muted hover:bg-surface-sunken hover:text-ink"
      >
        {copied ? (
          <Check aria-hidden className="size-4 text-leaf-strong" />
        ) : (
          <Copy aria-hidden className="size-4" />
        )}
      </button>
    </span>
  );
}
