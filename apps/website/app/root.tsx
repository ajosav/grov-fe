import {type ReactNode} from 'react';

import {Links, Meta, Outlet, Scripts, ScrollRestoration} from 'react-router';

import {themeInitScript} from '@grov/ui';

import type {Route} from './+types/root';
import './app.css';

export const links: Route.LinksFunction = () => [
  {rel: 'icon', href: '/brand/grov-app-icon.svg', type: 'image/svg+xml'},
  {rel: 'preload', href: '/img/hero-mile12.webp', as: 'image'},
];

/** Marks the document as scripted before paint, so `.js .rv` reveal styles never flash. */
const jsClassScript = `document.documentElement.classList.add('js');`;

export function Layout({children}: {children: ReactNode}) {
  return (
    <html lang="en-NG" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0B0B0B" />
        <script dangerouslySetInnerHTML={{__html: themeInitScript + jsClassScript}} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
