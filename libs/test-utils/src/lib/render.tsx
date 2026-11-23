import {type ReactElement, type ReactNode} from 'react';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {render, type RenderOptions} from '@testing-library/react';
import {createMemoryRouter, RouterProvider} from 'react-router';

import {type Api, ApiProvider} from '@grov/api';
import {ThemeProvider} from '@grov/ui';

export function testQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {queries: {retry: false, gcTime: Infinity}, mutations: {retry: false}},
  });
}

export interface ProvidersOptions {
  queryClient?: QueryClient;
  /** A partial Api: only the endpoints the test touches. */
  api?: Partial<Api>;
}

export function TestProviders({
  children,
  queryClient = testQueryClient(),
  api = {},
}: ProvidersOptions & {children: ReactNode}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider api={api as Api}>
        <ThemeProvider>{children}</ThemeProvider>
      </ApiProvider>
    </QueryClientProvider>
  );
}

/** Render with QueryClient, Api and Theme providers. */
export function renderWithProviders(
  ui: ReactElement,
  {queryClient, api, ...options}: ProvidersOptions & RenderOptions = {}
) {
  return render(ui, {
    wrapper: ({children}) => (
      <TestProviders queryClient={queryClient} api={api}>
        {children}
      </TestProviders>
    ),
    ...options,
  });
}

/** Render a set of routes at `initialPath`, inside the test providers. */
export function renderRoutes(
  routes: Parameters<typeof createMemoryRouter>[0],
  {initialPath = '/', ...options}: ProvidersOptions & {initialPath?: string} = {}
) {
  const router = createMemoryRouter(routes, {initialEntries: [initialPath]});
  const result = renderWithProviders(<RouterProvider router={router} />, options);
  return {...result, router};
}
