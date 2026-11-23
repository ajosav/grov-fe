import type {
  AuthResponse,
  CodeCompleteBody,
  CodeRequestBody,
  CodeVerifyBody,
  CodeVerifyResponse,
  ForgotPasswordAccepted,
  ForgotPasswordBody,
  LoginBody,
  OtpChallengeSummary,
  PhoneCompleteBody,
  ProviderNonce,
  ResetLinkCheck,
  ResetPasswordBody,
} from '@grov/models';

import type {ApiClient} from '../client';

/** `/v1/auth/*`. On web every token comes back as cookies; `tokens` in bodies is null. */
export function authApi(client: ApiClient) {
  const post = <T>(url: string, data?: unknown) => client.request<T>({method: 'post', url, data});
  return {
    // Customer app: passwordless email code (D37 as built in grov-be).
    requestCode: (body: CodeRequestBody) =>
      post<OtpChallengeSummary>('/v1/auth/code/request', body),
    verifyCode: (body: CodeVerifyBody) => post<CodeVerifyResponse>('/v1/auth/code/verify', body),
    completeProfile: (body: CodeCompleteBody) => post<AuthResponse>('/v1/auth/code/complete', body),

    // Google / Apple ID tokens, or password (admin console only).
    nonce: () => post<ProviderNonce>('/v1/auth/nonce', {}),
    login: (body: LoginBody) => post<AuthResponse>('/v1/auth/login', body),
    logout: () => post<Record<string, never>>('/v1/auth/logout', {forgetDevice: false}),

    // Gates
    completePhone: (body: PhoneCompleteBody) => post<AuthResponse>('/v1/auth/phone/complete', body),
    verifyEmail: (code: string) => post<AuthResponse>('/v1/auth/email/verify', {code}),
    resendEmailCode: () => post<OtpChallengeSummary>('/v1/auth/email/resend', {}),

    // Password reset (admin accounts)
    forgotPassword: (body: ForgotPasswordBody) =>
      post<ForgotPasswordAccepted>('/v1/auth/password/forgot', body),
    checkResetLink: (token: string) =>
      post<ResetLinkCheck>('/v1/auth/password/reset/check', {token}),
    resetPassword: (body: ResetPasswordBody) => post<AuthResponse>('/v1/auth/password/reset', body),
  };
}
export type AuthApi = ReturnType<typeof authApi>;
