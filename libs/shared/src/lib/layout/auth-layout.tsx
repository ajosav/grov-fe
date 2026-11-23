import {type ReactNode} from 'react';

import {appConfig} from '@grov/models';
import {Logo, ThemeToggle} from '@grov/ui';

export interface AuthLayoutProps {
  title: ReactNode;
  description?: ReactNode;
  /** Short line on the brand panel (hidden on phones). */
  tagline?: ReactNode;
  /** Small chip under the logo, e.g. "Admin console". */
  badge?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** Sign-in screens: night brand panel (from `lg`) beside one focused form. */
export function AuthLayout({
  title,
  description,
  tagline,
  badge,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-night p-10 text-on-night lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-pill bg-flame opacity-25 blur-3xl"
        />
        <div className="relative flex items-center gap-3 [&_*]:text-on-night">
          <Logo />
          {badge ? (
            <span className="rounded-pill bg-night-hi px-3 py-1 text-chip">{badge}</span>
          ) : null}
        </div>
        <p className="relative max-w-md font-display text-display-lg text-balance">
          {tagline ?? 'Plan your household food budget. Know what to buy.'}
        </p>
        <p className="relative text-body-sm text-on-night-muted">
          © {new Date().getFullYear()} {appConfig.brandName}
        </p>
      </aside>

      <main className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <span className="lg:hidden">
            <Logo />
          </span>
          <ThemeToggle compact />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 py-10">
          <header className="grid gap-2">
            <h1 className="text-title-lg text-balance">{title}</h1>
            {description ? <p className="text-body text-ink-muted">{description}</p> : null}
          </header>
          {children}
          {footer ? <div className="text-body-sm text-ink-muted">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
