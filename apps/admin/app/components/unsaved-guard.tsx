import {type ReactNode, useEffect, useRef} from 'react';

import {useBlocker} from 'react-router';

import {ConfirmDialog} from '@grov/ui';

/**
 * Warns before leaving a page with unsaved work: closing the tab, or following a link to
 * another page. Changing only the query string (switching tabs on the same page) is fine.
 * Call `allow()` just before navigating on purpose, after a successful save.
 */
export function useUnsavedGuard(dirty: boolean): {dialog: ReactNode; allow: () => void} {
  const allowed = useRef(false);
  const blocker = useBlocker(
    ({currentLocation, nextLocation}) =>
      dirty && !allowed.current && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (allowed.current) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const dialog = (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      onOpenChange={open => {
        if (!open && blocker.state === 'blocked') blocker.reset();
      }}
      title="Leave without saving?"
      description="You have changes that haven’t been saved. If you leave now, they’re lost."
      confirmLabel="Leave page"
      cancelLabel="Keep editing"
      tone="danger"
      onConfirm={() => {
        if (blocker.state === 'blocked') blocker.proceed();
      }}
    />
  );

  return {
    dialog,
    allow: () => {
      allowed.current = true;
    },
  };
}
