import {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';

import {appConfig} from '@grov/models';
import {cn, useTheme} from '@grov/ui';

/**
 * Cloudflare Turnstile, explicit rendering, no npm dependency. grov-be checks
 * the token on POST /v1/auth/code/request and /v1/auth/password/forgot and
 * compares `action` with the endpoint, so a token can't be reused on another
 * form. Tokens are single use: call `reset()` after every request that sent one.
 *
 * Renders nothing when VITE_TURNSTILE_SITE_KEY is empty (local dev without it).
 */
export type TurnstileAction = 'sign-in-code' | 'password-reset';

export interface TurnstileHandle {
  reset: () => void;
}

export interface TurnstileProps {
  action: TurnstileAction;
  /** The new token, or null when it expired or the check errored. */
  onToken: (token: string | null) => void;
  className?: string;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile failed to load'));
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Turnstile failed to load'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export const isTurnstileEnabled = (): boolean => Boolean(appConfig.turnstileSiteKey);

export const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(function Turnstile(
  {action, onToken, className},
  ref
) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const {resolved} = useTheme();

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      onTokenRef.current(null);
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    if (!isTurnstileEnabled() || !container.current) return undefined;
    let cancelled = false;
    loadTurnstile()
      .then(api => {
        if (cancelled || !container.current) return;
        widgetId.current = api.render(container.current, {
          sitekey: appConfig.turnstileSiteKey,
          action,
          theme: resolved,
          size: 'flexible',
          // Most people never see it; it shows only when Cloudflare wants an interaction.
          appearance: 'interaction-only',
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [action, resolved]);

  if (!isTurnstileEnabled()) return null;
  return <div ref={container} className={cn('min-h-0 empty:hidden', className)} />;
});
