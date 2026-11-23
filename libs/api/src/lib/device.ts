import {appConfig, type DeviceInput} from '@grov/models';

const STORAGE_KEY = `${appConfig.cookiePrefix}.device-id`;

/** RFC 9562 UUID v7 (grov-be ids are v7). */
export function uuidv7(now: number = Date.now()): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let ts = now;
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ts & 0xff;
    ts = Math.floor(ts / 256);
  }
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x70;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function browserName(ua: string): string {
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\//.test(ua)) return 'Opera';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Browser';
}

function osName(ua: string): string {
  if (/iPhone|iPad/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Mac OS X/.test(ua)) return 'macOS';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Linux/.test(ua)) return 'Linux';
  return 'web';
}

/**
 * The `device` every sign-in sends. The id is a stable, random per-browser id:
 * grov-be uses it to recognise returning devices (they skip network limits)
 * and to send a "new sign-in" notice for unseen ones.
 */
export function webDevice(): DeviceInput {
  let id: string | undefined;
  try {
    id = window.localStorage.getItem(STORAGE_KEY) ?? undefined;
    if (!id) {
      id = uuidv7();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  } catch {
    id = undefined;
  }
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  return {id, platform: 'WEB', name: `${browserName(ua)} on ${osName(ua)}`.slice(0, 80)};
}
