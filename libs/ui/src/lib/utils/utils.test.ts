import {formatNaira} from './money';
import {formatNigerianPhone, toE164Nigeria} from './phone';

describe('formatNaira', () => {
  it('formats kobo as whole naira with separators', () => {
    expect(formatNaira(18_450_000)).toBe('₦184,500');
  });
  it('uses a true minus and optional sign', () => {
    expect(formatNaira(-120_000)).toBe('−₦1,200');
    expect(formatNaira(50_000, {signed: true})).toBe('+₦500');
  });
  it('shows kobo only when asked', () => {
    expect(formatNaira(123_456, {showKobo: true})).toBe('₦1,234.56');
  });
});

describe('toE164Nigeria', () => {
  it.each(['0803 123 4567', '803 123 4567', '+234 803 123 4567', '2348031234567'])(
    'accepts %s',
    input => expect(toE164Nigeria(input)).toBe('+2348031234567')
  );
  it.each(['', '123', '+44 20 7946 0958'])('rejects %s', input => {
    expect(toE164Nigeria(input)).toBeNull();
  });
  it('formats for display', () => {
    expect(formatNigerianPhone('+2348031234567')).toBe('0803 123 4567');
  });
});
