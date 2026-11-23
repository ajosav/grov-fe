import {Monitor, Moon, Sun} from 'lucide-react';

import {ThemePreference} from '@grov/models';

import {useTheme} from '../theme/theme-provider';
import {cn} from '../utils/cn';

const OPTIONS = [
  {value: ThemePreference.LIGHT, label: 'Light', Icon: Sun},
  {value: ThemePreference.SYSTEM, label: 'Device', Icon: Monitor},
  {value: ThemePreference.DARK, label: 'Dark', Icon: Moon},
] as const;

export interface ThemeToggleProps {
  className?: string;
  /** Icons only (headers); labels stay for screen readers. */
  compact?: boolean;
}

/** Light · Device · Dark. "Device" follows the operating system setting. */
export function ThemeToggle({className, compact}: ThemeToggleProps) {
  const {preference, setPreference} = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn('inline-flex items-center gap-1 rounded-pill bg-surface-sunken p-1', className)}
    >
      {OPTIONS.map(({value, label, Icon}) => {
        const checked = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => setPreference(value)}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-pill px-3 text-body-sm font-semibold text-ink-muted transition-colors hover:text-ink',
              compact && 'w-9 justify-center px-0',
              checked && 'bg-surface text-ink shadow-glass'
            )}
          >
            <Icon aria-hidden className="size-4" />
            <span className={cn(compact && 'sr-only')}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
