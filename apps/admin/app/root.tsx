import {type ReactNode} from 'react';

import {Links, Meta, Outlet, Scripts, ScrollRestoration} from 'react-router';

import {appConfig, Audience} from '@grov/models';
import {AppProviders, FullPageSpinner, RouteErrorContent} from '@grov/shared';
import {themeInitScript} from '@grov/ui';

import type {Route} from './+types/root';
import './app.css';

export const meta: Route.MetaFunction = () => [
  {title: `${appConfig.brandName} admin`},
  {name: 'robots', content: 'noindex, nofollow'},
];

export const links: Route.LinksFunction = () => [
  {rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml'},
];

export function Layout({children}: {children: ReactNode}) {
  return (
    <html lang="en-NG" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{__html: themeInitScript}} />
        <Meta />
        <Links />
      </head>
      <body className="min-h-dvh bg-canvas font-sans text-ink antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AppProviders audience={Audience.ADMIN}>
      <Outlet />
    </AppProviders>
  );
}

export function HydrateFallback() {
  return <FullPageSpinner />;
}

export function ErrorBoundary({error}: Route.ErrorBoundaryProps) {
  return <RouteErrorContent error={error} />;
}
