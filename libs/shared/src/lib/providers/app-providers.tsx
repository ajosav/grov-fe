import {type ReactNode, useEffect, useRef, useState} from 'react';

import {GoogleOAuthProvider} from '@react-oauth/google';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';

import {type Api, ApiProvider, createApi, isApiError, queryKeys} from '@grov/api';
import {useMe, useUpdateMe} from '@grov/hooks';
import {appConfig, type Audience, type ThemePreference} from '@grov/models';
import {ThemeProvider, toast, Toaster, TooltipProvider, useTheme} from '@grov/ui';

import {toastError} from '../errors';

export interface AppProvidersProps {
  audience: Audience;
  children: ReactNode;
}

/**
 * Every failed request says so in a toast at the bottom of the screen, with grov-be's own message
 * word for word (the app's copy only when grov-be never answered). Forms still put field
 * messages under their fields; this is the one place the request-level message is shown, so
 * callers don't toast errors themselves. The id stops the same failure stacking up.
 */
function toastFailure(error: unknown) {
  // A 401 is the session ending, which `onSessionEnded` announces once.
  if (isApiError(error) && error.status === 401) return;
  toastError(error);
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({onError: toastFailure}),
    mutationCache: new MutationCache({onError: toastFailure}),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        // 4xx answers will not change on retry; network and 5xx get two more tries.
        retry: (count, error) =>
          !(isApiError(error) && error.status >= 400 && error.status < 500) && count < 2,
      },
      mutations: {retry: false},
    },
  });
}

/**
 * Everything an app needs around its routes: query cache, API client for this
 * audience, theme (synced to the account), Google sign-in, tooltips and toasts.
 */
export function AppProviders({audience, children}: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient);
  const [api] = useState<Api>(() =>
    createApi({
      baseURL: appConfig.apiBaseUrl,
      audience,
      cookiePrefix: appConfig.cookiePrefix,
      onSessionEnded: () => {
        // Only tell people who were signed in. On a first visit the 401 from
        // /v1/me simply means "signed out" and useMe resolves to null itself.
        if (!queryClient.getQueryData(queryKeys.me)) return;
        queryClient.removeQueries({predicate: query => query.queryKey[0] !== queryKeys.me[0]});
        queryClient.setQueryData(queryKeys.me, null);
        toast('You were signed out. Sign in again to carry on.');
      },
    })
  );

  const content = (
    <QueryClientProvider client={queryClient}>
      <ApiProvider api={api}>
        <ThemeLayer>
          <TooltipProvider delayDuration={300}>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeLayer>
      </ApiProvider>
    </QueryClientProvider>
  );

  return appConfig.googleClientId ? (
    <GoogleOAuthProvider clientId={appConfig.googleClientId}>{content}</GoogleOAuthProvider>
  ) : (
    content
  );
}

/** Theme follows the account: a saved account theme wins on sign-in; changes are saved back. */
function ThemeLayer({children}: {children: ReactNode}) {
  const queryClient = useQueryClient();
  const updateMe = useUpdateMe();
  const save = (theme: ThemePreference) => {
    if (queryClient.getQueryData(queryKeys.me)) updateMe.mutate({theme});
  };
  return (
    <ThemeProvider onPreferenceChange={save}>
      <AccountThemeSync />
      {children}
    </ThemeProvider>
  );
}

function AccountThemeSync() {
  const {data: me} = useMe();
  const {preference, setPreference} = useTheme();
  const applied = useRef<string | null>(null);
  useEffect(() => {
    const saved = me?.theme;
    if (!me || applied.current === me.id) return;
    applied.current = me.id;
    if ((saved === 'light' || saved === 'dark' || saved === 'system') && saved !== preference) {
      setPreference(saved, {notify: false});
    }
  }, [me, preference, setPreference]);
  return null;
}
