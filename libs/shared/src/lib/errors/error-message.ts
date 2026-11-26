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
  [ErrorCode.STORE_OUT_OF_SCOPE]: 'You don’t have access to this store.',
  [ErrorCode.STORE_NOT_FOUND]: 'This store no longer exists.',
  [ErrorCode.STORE_SLUG_TAKEN]: 'Another store already uses this slug. Pick another.',
  [ErrorCode.STORE_ZONE_INVALID]:
    'That delivery zone isn’t a valid shape. Check that no edges cross, then save again.',
  [ErrorCode.CATEGORY_NOT_FOUND]: 'This category no longer exists.',
  [ErrorCode.CATEGORY_SLUG_TAKEN]: 'A category with this name already exists. Use another name.',
  [ErrorCode.CATEGORY_INVALID_PARENT]:
    'Categories nest one level only. Pick a top-level parent, and a category with sub-categories can’t become one.',
  [ErrorCode.PRODUCT_NOT_FOUND]: 'This product no longer exists.',
  [ErrorCode.PRODUCT_SKU_TAKEN]: 'Another product already uses this SKU.',
  [ErrorCode.CATEGORY_IN_USE]:
    'This category still has products, sub-categories or price markups. Make it inactive instead.',
  [ErrorCode.PRODUCT_CATEGORY_INVALID]: 'Pick an active category.',
  [ErrorCode.PRODUCT_SIZE_LADDER_INVALID]:
    'The sizes don’t add up. Check the highlighted rows and save again.',
  [ErrorCode.PRODUCT_INACTIVE]:
    'This product is inactive, so it can’t be listed. Make it active first.',
  [ErrorCode.LISTING_NOT_FOUND]: 'This store doesn’t list that product.',
  [ErrorCode.CITY_NOT_FOUND]: 'That city no longer exists. Pick another.',
  [ErrorCode.CITY_CODE_TAKEN]: 'Another city already uses this code.',
  [ErrorCode.ROLE_LOCKED]: 'The super admin role can’t be changed.',
  [ErrorCode.ROLE_SYSTEM]: 'Built-in roles keep their name and can’t be archived.',
  [ErrorCode.ROLE_ARCHIVED]: 'Restore this role before changing it.',
  [ErrorCode.ROLE_KEY_TAKEN]: 'Another role already has this name.',
  [ErrorCode.ROLE_PERMISSION_NOT_HELD]: 'You can only add or remove permissions you hold yourself.',
  [ErrorCode.STAFF_NOT_FOUND]: 'This person no longer has admin access.',
  [ErrorCode.STAFF_SELF_CHANGE]: 'You can’t change your own access. Ask another admin.',
  [ErrorCode.STAFF_GRANT_DENIED]:
    'This gives or takes away access you don’t have yourself. Ask an admin with more access.',
  [ErrorCode.STAFF_LAST_SUPER_ADMIN]: 'There must always be at least one super admin.',
  [ErrorCode.STAFF_UNKNOWN_ROLES]:
    'One of these roles was archived or removed. Refresh and try again.',
  [ErrorCode.INVITE_INVALID]: 'This invite link isn’t valid. Check you used the whole link.',
  [ErrorCode.INVITE_EXPIRED]: 'This invite has expired. Ask whoever invited you to send it again.',
  [ErrorCode.INVITE_USED]: 'This invite was already accepted. Sign in instead.',
  [ErrorCode.INVITE_REVOKED]: 'This invite was cancelled. Ask whoever invited you for a new one.',
  [ErrorCode.INVITE_NOT_PENDING]: 'This invite was already accepted or cancelled.',
  [ErrorCode.INVITE_ALREADY_STAFF]: 'This person already has admin access.',
  [ErrorCode.INVITE_PENDING_EXISTS]:
    'This email already has an invite waiting. Resend that one instead.',
  [ErrorCode.INVITE_RESEND_TOO_SOON]: 'This invite was just sent. Wait a minute before resending.',
  [ErrorCode.INVITE_EMAIL_MISMATCH]: 'That Google account uses a different email from the invite.',
  [ErrorCode.STOCK_INSUFFICIENT]:
    'There isn’t enough stock for that. Check the quantity and try again.',
  [ErrorCode.STOCK_BELOW_RESERVED]:
    'That would take stock below what is already reserved for paid orders. Enter at least the reserved amount.',
  [ErrorCode.STOCK_RESERVATION_MISMATCH]:
    'More was released than is reserved. Refresh the page and check the stock again.',
  [ErrorCode.STOCK_TRANSFER_SAME_STORE]: 'Pick a different store to move the stock to.',
  [ErrorCode.STOCK_REF_REUSED]:
    'This was already recorded with different details. Refresh the page and check the stock.',
  [ErrorCode.CSRF_FAILED]: 'Your session needs a refresh. Reload the page and try again.',
};

export function errorMessage(
  error: unknown,
  fallback = 'Something went wrong. Try again.'
): string {
  if (!isApiError(error)) return fallback;
  // A rejected form: the field messages sit under the fields, this is the summary at the bottom.
  if (error.code === ErrorCode.VALIDATION_FAILED && !COPY[error.code]) {
    return Object.keys(error.fieldErrors).length > 0
      ? 'Something went wrong. Check the highlighted fields and try again.'
      : 'Something went wrong. Check what you entered and try again.';
  }
  return (
    COPY[error.code] ??
    (error.status >= 500 ? 'Something went wrong on our side. Try again.' : fallback)
  );
}
