import {isRouteErrorResponse, Link} from 'react-router';

import {Button} from '@grov/ui';

/** Body for each app's root ErrorBoundary and catch-all route. */
export function RouteErrorContent({error}: {error?: unknown}) {
  const notFound = error === undefined || (isRouteErrorResponse(error) && error.status === 404);
  if (!notFound && error) console.error(error);
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-6">
      <p className="text-chip uppercase tracking-wide text-flame-strong">
        {notFound ? 'Page not found' : 'Something went wrong'}
      </p>
      <h1 className="text-title-lg">
        {notFound ? 'We can’t find that page' : 'This page hit a problem'}
      </h1>
      <p className="text-body text-ink-muted">
        {notFound
          ? 'The link may be old, or the page has moved.'
          : 'Try again. If it keeps happening, tell support what you were doing.'}
      </p>
      <div className="flex gap-2">
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
        {notFound ? null : (
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload
          </Button>
        )}
      </div>
    </main>
  );
}
