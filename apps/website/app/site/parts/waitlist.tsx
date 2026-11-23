import {type FormEvent, useState} from 'react';

const VARIANTS = {
  hero: {
    id: 'join',
    className: 'wl fade',
    style: {animationDelay: '.6s'},
    boxClass: 'wl-box frost',
    hint: 'We’ll text you once when Grov opens in your area. No spam.',
  },
  end: {
    id: undefined,
    className: 'wl',
    style: {marginTop: '28px'},
    boxClass: 'wl-box',
    hint: 'One text when we open. That’s it.',
  },
} as const;

const CITIES = ['Lagos', 'Ibadan', 'Abuja', 'Port Harcourt', 'Abeokuta'];

/** Nigerian mobile number → 10 national digits (without the 0), or null. */
export function nationalDigits(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('234')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return /^[789][01]\d{8}$/.test(digits) ? digits : null;
}

/**
 * Waitlist sign-up. Front end only, as on the original page: there is no
 * public waitlist endpoint yet (grov-be's PUT /v1/waitlist needs a signed-in
 * customer and a pin). TODO(backend): public waitlist endpoint, then POST here.
 */
export function Waitlist({variant}: {variant: keyof typeof VARIANTS}) {
  const v = VARIANTS[variant];
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lagos');
  const [error, setError] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const suffix = variant;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const digits = nationalDigits(phone);
    if (!digits) {
      setError(true);
      document.getElementById(`phone-${suffix}`)?.focus();
      return;
    }
    setDone(
      `We’ll text 0${digits.slice(0, 3)} ••• ${digits.slice(-4)} once, when Grov opens ${
        city ? `in ${city}` : 'near you'
      }.`
    );
  };

  return (
    <div
      className={done ? `${v.className} is-done` : v.className}
      id={v.id}
      style={v.style}
      data-wl=""
    >
      <form className="wl-form" noValidate onSubmit={submit}>
        <label className="sr" htmlFor={`phone-${suffix}`}>
          Phone number
        </label>
        <div className={v.boxClass}>
          <span className="wl-cc">
            <span className="flag" aria-hidden="true" />
            +234
          </span>
          <input
            id={`phone-${suffix}`}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="0803 123 4567"
            aria-describedby={`msg-${suffix}`}
            aria-invalid={error || undefined}
            value={phone}
            onChange={event => {
              setPhone(event.target.value);
              setError(false);
            }}
          />
          <button className="pill pill-light" type="submit">
            Join the waitlist
          </button>
        </div>
        <div className="wl-opts">
          <label className="hh" htmlFor={`city-${suffix}`}>
            In{' '}
            <select
              id={`city-${suffix}`}
              value={city}
              onChange={event => setCity(event.target.value)}
            >
              {CITIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="">Somewhere else</option>
            </select>
          </label>
          <label className="hh" htmlFor={`hh-${suffix}`}>
            Feeding{' '}
            <select id={`hh-${suffix}`} defaultValue="family">
              <option value="family">a family</option>
              <option value="solo">just me</option>
              <option value="duo">two of us</option>
              <option value="roommates">roommates</option>
            </select>
          </label>
        </div>
        <p className={error ? 'wl-msg err' : 'wl-msg'} id={`msg-${suffix}`} aria-live="polite">
          {error ? 'Enter your phone number, like 0803 123 4567.' : v.hint}
        </p>
      </form>
      <div className="wl-done" role="status">
        <span className="tick">
          <svg className="icon">
            <use href="#i-check" />
          </svg>
        </span>
        <div>
          <strong>You’re on the list.</strong>
          <p>{done}</p>
        </div>
      </div>
    </div>
  );
}
