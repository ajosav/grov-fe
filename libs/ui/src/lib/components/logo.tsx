import {appConfig} from '@grov/models';

import {cn} from '../utils/cn';

export interface LogoProps {
  className?: string;
  /** Hide the name and keep the mark (e.g. a collapsed sidebar). */
  markOnly?: boolean;
}

/**
 * Brand mark + the configured product name. The name is configuration (D65),
 * so this never ships the wordmark as a fixed image.
 */
export function Logo({className, markOnly}: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-ink', className)}>
      <svg aria-hidden viewBox="0 0 32 32" className="size-8 shrink-0">
        <rect width="32" height="32" rx="9" className="fill-night" />
        <circle cx="16" cy="17.5" r="7.5" className="fill-flame" />
        <path d="M16 10c1.6-3 4.3-4.2 6.6-3.6-.6 2.5-3 4-6.6 3.6Z" className="fill-leaf" />
      </svg>
      {markOnly ? (
        <span className="sr-only">{appConfig.brandName}</span>
      ) : (
        <span className="font-display text-title-md lowercase tracking-tight">
          {appConfig.brandName}
        </span>
      )}
    </span>
  );
}
