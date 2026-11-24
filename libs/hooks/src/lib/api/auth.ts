import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys, useApi, webDevice} from '@grov/api';
import {
  type Audience,
  type AuthResponse,
  type CodeCompleteBody,
  type ConsentBody,
  type ForgotPasswordBody,
  type PasswordInviteAcceptBody,
} from '@grov/models';

function useRefreshMe() {
  const queryClient = useQueryClient();
  return (response?: AuthResponse) =>
    queryClient.invalidateQueries({queryKey: queryKeys.me}).then(() => response);
}

export function useRequestCode() {
  const api = useApi();
  return useMutation({
    mutationFn: ({email, captchaToken}: {email: string; captchaToken?: string}) =>
      api.auth.requestCode({email, captchaToken}),
  });
}

export function useVerifyCode() {
  const api = useApi();
  const refreshMe = useRefreshMe();
  return useMutation({
    mutationFn: ({email, code}: {email: string; code: string}) =>
      api.auth.verifyCode({email, code, device: webDevice()}),
    onSuccess: async result => {
      if (result.state === 'SIGNED_IN') await refreshMe();
    },
  });
}

export function useCompleteProfile() {
  const api = useApi();
  const refreshMe = useRefreshMe();
  return useMutation({
    mutationFn: (body: Omit<CodeCompleteBody, 'device'>) =>
      api.auth.completeProfile({...body, device: webDevice()}),
    onSuccess: refreshMe,
  });
}

export function useGoogleSignIn(audience: Audience) {
  const api = useApi();
  const refreshMe = useRefreshMe();
  return useMutation({
    mutationFn: ({
      idToken,
      nonce,
      termsVersion,
    }: {
      idToken: string;
      nonce?: string;
      termsVersion?: string;
    }) =>
      api.auth.login({
        method: 'GOOGLE',
        idToken,
        nonce,
        termsVersion,
        audience,
        device: webDevice(),
      }),
    onSuccess: refreshMe,
  });
}

export function useProviderNonce(enabled = true) {
  const api = useApi();
  return useQuery({
    queryKey: ['auth', 'nonce'],
    queryFn: api.auth.nonce,
    enabled,
    gcTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

/** Password sign-in. grov-be accepts it for the admin console only. */
export function usePasswordSignIn(audience: Audience) {
  const api = useApi();
  const refreshMe = useRefreshMe();
  return useMutation({
    mutationFn: ({email, password}: {email: string; password: string}) =>
      api.auth.login({method: 'PASSWORD', email, password, audience, device: webDevice()}),
    onSuccess: refreshMe,
  });
}

export function useSignOut() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSettled: () => {
      queryClient.removeQueries({predicate: query => query.queryKey[0] !== queryKeys.me[0]});
      queryClient.setQueryData(queryKeys.me, null);
    },
  });
}

export function useCompletePhone() {
  const api = useApi();
  const refreshMe = useRefreshMe();
  return useMutation({
    mutationFn: (phone: string) => api.auth.completePhone({phone}),
    onSuccess: refreshMe,
  });
}

export function useAcceptConsent() {
  const api = useApi();
  const refreshMe = useRefreshMe();
  return useMutation({
    mutationFn: (body: ConsentBody) => api.me.acceptConsent(body),
    onSuccess: refreshMe,
  });
}

export function useVerifyEmail() {
  const api = useApi();
  const refreshMe = useRefreshMe();
  return useMutation({
    mutationFn: (code: string) => api.auth.verifyEmail(code),
    onSuccess: refreshMe,
  });
}

export function useResendEmailCode() {
  const api = useApi();
  return useMutation({mutationFn: () => api.auth.resendEmailCode()});
}

export function useForgotPassword() {
  const api = useApi();
  return useMutation({mutationFn: (body: ForgotPasswordBody) => api.auth.forgotPassword(body)});
}

export function useResetLinkCheck(token: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ['auth', 'reset-link', token],
    queryFn: () => api.auth.checkResetLink(token ?? ''),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useResetPassword() {
  const api = useApi();
  const refreshMe = useRefreshMe();
  return useMutation({
    mutationFn: ({token, password}: {token: string; password: string}) =>
      api.auth.resetPassword({token, password, device: webDevice()}),
    onSuccess: refreshMe,
  });
}

export function useInviteCheck(token: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.inviteCheck(token ?? ''),
    queryFn: () => api.auth.checkInvite(token ?? ''),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });
}

export function useAcceptInvite() {
  const api = useApi();
  const refreshMe = useRefreshMe();
  return useMutation({
    mutationFn: (body: Omit<PasswordInviteAcceptBody, 'method' | 'device'>) =>
      api.auth.acceptInvite({...body, method: 'PASSWORD', device: webDevice()}),
    onSuccess: refreshMe,
  });
}
