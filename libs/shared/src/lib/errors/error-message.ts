import {isApiError} from '@grov/api';
import {ErrorCode} from '@grov/models';

/**
 * User-facing copy for an error. Copy is built from the stable `code` (and
 * `params`), never from the server's developer `message`.
 */
const COPY: Partial<Record<string, string>> = {
  [ErrorCode.NETWORK_ERROR]: 'Can’t reach us right now. Check your connection and try again.',
  [ErrorCode.CAPTCHA_REQUIRED]: 'Finish the quick check above, then try again.',
  [ErrorCode.CAPTCHA_FAILED]: 'The quick check didn’t go through. Try it again.',
  [ErrorCode.RATE_LIMITED]: 'Too many tries. Wait a moment, then try again.',
  [ErrorCode.OTP_INVALID]: 'That code isn’t right. Check the email and try again.',
  [ErrorCode.OTP_EXPIRED]: 'That code has expired. Send a new one.',
  [ErrorCode.OTP_LOCKED]: 'Too many wrong codes. Send a new one.',
  [ErrorCode.OTP_RESEND_TOO_SOON]: 'A code is on its way. You can ask for another shortly.',
  [ErrorCode.OTP_REGISTRATION_INVALID]: 'This sign-up timed out. Start again with your email.',
  [ErrorCode.PHONE_TAKEN]:
    'This number is already on an account. Log in with that email, or use a different number.',
  [ErrorCode.PHONE_INVALID]: 'Enter a Nigerian phone number, like 0803 123 4567.',
  [ErrorCode.INVALID_CREDENTIALS]: 'That email and password don’t match.',
  [ErrorCode.ACCOUNT_LOCKED]: 'Too many attempts. Try again later or reset your password.',
  [ErrorCode.ACCOUNT_SUSPENDED]: 'This account is suspended. Contact support.',
  [ErrorCode.MEMBERSHIP_REQUIRED]: 'This account doesn’t have access here.',
  [ErrorCode.MEMBERSHIP_SUSPENDED]: 'Your access here is suspended. Ask an admin to restore it.',
  [ErrorCode.EMAIL_CONFLICT]:
    'This email already has an account. Sign in with your email code first, then link Google.',
  [ErrorCode.PROVIDER_EMAIL_UNVERIFIED]: 'Your Google email isn’t verified yet.',
  [ErrorCode.PROVIDER_TOKEN_INVALID]: 'Google sign-in didn’t go through. Try again.',
  [ErrorCode.RESET_LINK_EXPIRED]: 'This link has expired. Ask for a new one.',
  [ErrorCode.RESET_LINK_USED]: 'This link was already used. Ask for a new one.',
  [ErrorCode.PASSWORD_WEAK]: 'Use at least 8 characters with a symbol.',
  [ErrorCode.PASSWORD_COMMON]: 'That password is too common. Pick another.',
  [ErrorCode.PASSWORD_NOT_SET]:
    'This account has no password yet. Use Google, or reset your password.',
  [ErrorCode.PERMISSION_DENIED]: 'You don’t have permission to do that.',
  [ErrorCode.CSRF_FAILED]: 'Your session needs a refresh. Reload the page and try again.',
};

export function errorMessage(
  error: unknown,
  fallback = 'Something went wrong. Try again.'
): string {
  if (!isApiError(error)) return fallback;
  return (
    COPY[error.code] ??
    (error.status >= 500 ? 'Something went wrong on our side. Try again.' : fallback)
  );
}
