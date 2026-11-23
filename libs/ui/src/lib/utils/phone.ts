import {parsePhoneNumberFromString} from 'libphonenumber-js/min';

/**
 * Nigerian numbers (+234). Accepts `0803 123 4567`, `803 123 4567` and
 * `+234 803 123 4567`; returns E.164 (`+2348031234567`) or null. The server
 * normalises again and is the source of truth (`PHONE_INVALID`).
 */
export function toE164Nigeria(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, '');
  if (!digits) return null;
  const candidate = digits.startsWith('+') ? digits : `+234${digits.replace(/^(234|0)/, '')}`;
  const parsed = parsePhoneNumberFromString(candidate, 'NG');
  return parsed && parsed.isValid() && parsed.country === 'NG' ? parsed.number : null;
}

/** `+2348031234567` → `0803 123 4567`. */
export function formatNigerianPhone(e164: string): string {
  const parsed = parsePhoneNumberFromString(e164, 'NG');
  return parsed ? parsed.formatNational() : e164;
}
