import {useRef, useState} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {z} from 'zod';

import {isApiError} from '@grov/api';
import {
  useClientConfig,
  useCompleteProfile,
  useCountdown,
  useRequestCode,
  useVerifyCode,
} from '@grov/hooks';
import {ErrorCode} from '@grov/models';
import {useSignInStore} from '@grov/store';
import {Alert, Button, Field, Input, OtpInput, PhoneInput, toast, toE164Nigeria} from '@grov/ui';

import {errorMessage} from '../errors';
import {isTurnstileEnabled, Turnstile, type TurnstileHandle} from './turnstile';

/* ---------------------------------------------------------------- email */

const emailSchema = z.object({email: z.email('Enter a valid email address').max(254)});

export interface EmailStepProps {
  redirectTo?: string | null;
  onCodeSent: () => void;
}

/** Step 1: email. One endpoint for new and existing accounts (no account lookup leaks). */
export function EmailStep({redirectTo, onCodeSent}: EmailStepProps) {
  const savedEmail = useSignInStore(s => s.email);
  const start = useSignInStore(s => s.start);
  const requestCode = useRequestCode();
  const turnstile = useRef<TurnstileHandle>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const waitingForCheck = isTurnstileEnabled() && !captchaToken;
  const form = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {email: savedEmail ?? ''},
  });

  const submit = form.handleSubmit(({email}) => {
    const normalised = email.trim().toLowerCase();
    requestCode.mutate(
      {email: normalised, captchaToken: captchaToken ?? undefined},
      {
        onSuccess: challenge => {
          start(normalised, challenge, redirectTo);
          onCodeSent();
        },
        // Turnstile tokens are single use.
        onSettled: () => turnstile.current?.reset(),
      }
    );
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <Field label="Email" error={form.formState.errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          inputMode="email"
          autoFocus
          placeholder="you@example.com"
          {...form.register('email')}
        />
      </Field>
      <Turnstile ref={turnstile} action="sign-in-code" onToken={setCaptchaToken} />
      {requestCode.isError ? <Alert tone="danger">{errorMessage(requestCode.error)}</Alert> : null}
      <Button type="submit" block loading={requestCode.isPending} disabled={waitingForCheck}>
        Continue
      </Button>
    </form>
  );
}

/* ----------------------------------------------------------------- code */

export interface CodeStepProps {
  onSignedIn: () => void;
  onProfileRequired: () => void;
  onChangeEmail: () => void;
}

/** Step 2: the 6-digit code from the email. Signs an existing account in. */
export function CodeStep({onSignedIn, onProfileRequired, onChangeEmail}: CodeStepProps) {
  const {email, challenge, setChallenge, setRegistration} = useSignInStore();
  const [code, setCode] = useState('');
  const verify = useVerifyCode();
  const resend = useRequestCode();
  const wait = useCountdown(challenge?.nextSendAt);
  const turnstile = useRef<TurnstileHandle>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  if (!email) {
    return (
      <Alert tone="info" title="Start with your email">
        <Button variant="link" onClick={onChangeEmail}>
          Enter your email
        </Button>
      </Alert>
    );
  }

  const submit = (value: string) => {
    if (value.length !== 6 || verify.isPending) return;
    verify.mutate(
      {email, code: value},
      {
        onSuccess: result => {
          if (result.state === 'PROFILE_REQUIRED' && result.registration) {
            setRegistration(result.registration);
            onProfileRequired();
          } else {
            onSignedIn();
          }
        },
        onError: () => setCode(''),
      }
    );
  };

  const codeDead =
    isApiError(verify.error) &&
    (verify.error.code === ErrorCode.OTP_LOCKED || verify.error.code === ErrorCode.OTP_EXPIRED);

  return (
    <form
      className="grid gap-5"
      onSubmit={event => {
        event.preventDefault();
        submit(code);
      }}
    >
      <p className="text-body text-ink-muted">
        We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>.{' '}
        <button
          type="button"
          className="font-semibold text-ink underline underline-offset-4"
          onClick={onChangeEmail}
        >
          Change
        </button>
      </p>
      <OtpInput
        value={code}
        onChange={value => {
          setCode(value);
          if (value.length === 6) submit(value);
        }}
        autoFocus
        aria-label="6-digit code"
        disabled={verify.isPending}
      />
      {verify.isError ? <Alert tone="danger">{errorMessage(verify.error)}</Alert> : null}
      <Button
        type="submit"
        block
        loading={verify.isPending}
        disabled={code.length !== 6 || codeDead}
      >
        Continue
      </Button>
      <Turnstile ref={turnstile} action="sign-in-code" onToken={setCaptchaToken} />
      <Button
        variant="ghost"
        block
        disabled={wait > 0 || resend.isPending || (isTurnstileEnabled() && !captchaToken)}
        onClick={() =>
          resend.mutate(
            {email, captchaToken: captchaToken ?? undefined},
            {
              onSuccess: next => {
                setChallenge(next);
                verify.reset();
                toast.success('New code sent');
              },
              onError: error => toast.error(errorMessage(error)),
              onSettled: () => turnstile.current?.reset(),
            }
          )
        }
      >
        {wait > 0 ? `Send a new code in ${wait}s` : 'Send a new code'}
      </Button>
    </form>
  );
}

/* -------------------------------------------------------------- profile */

const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name').max(80),
  lastName: z.string().trim().min(1, 'Enter your last name').max(80),
  phone: z
    .string()
    .trim()
    .refine(
      value => toE164Nigeria(value) !== null,
      'Enter a Nigerian phone number, like 0803 123 4567'
    ),
});

export interface ProfileStepProps {
  onDone: () => void;
  onRestart: () => void;
}

/** Step 3 (new accounts): name and phone. The code already proved the email. */
export function ProfileStep({onDone, onRestart}: ProfileStepProps) {
  const registration = useSignInStore(s => s.registration);
  const config = useClientConfig();
  const complete = useCompleteProfile();
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {firstName: '', lastName: '', phone: ''},
  });

  if (!registration) {
    return (
      <Alert tone="info" title="This sign-up timed out">
        <Button variant="link" onClick={onRestart}>
          Start again with your email
        </Button>
      </Alert>
    );
  }

  const submit = form.handleSubmit(values => {
    const termsVersion = config.data?.legal.termsVersion;
    if (!termsVersion) return;
    complete.mutate(
      {
        ticket: registration.ticket,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: toE164Nigeria(values.phone) ?? values.phone,
        termsVersion,
      },
      {
        onSuccess: onDone,
        onError: error => {
          if (
            isApiError(error) &&
            (error.code === ErrorCode.PHONE_TAKEN || error.code === ErrorCode.PHONE_INVALID)
          ) {
            form.setError('phone', {message: errorMessage(error)});
          }
        },
      }
    );
  });

  const phoneError = form.formState.errors.phone?.message;
  const otherError =
    complete.isError && !(isApiError(complete.error) && complete.error.code.startsWith('PHONE_'))
      ? errorMessage(complete.error)
      : null;

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" error={form.formState.errors.firstName?.message}>
          <Input autoComplete="given-name" autoFocus {...form.register('firstName')} />
        </Field>
        <Field label="Last name" error={form.formState.errors.lastName?.message}>
          <Input autoComplete="family-name" {...form.register('lastName')} />
        </Field>
      </div>
      <Field
        label="Phone"
        hint="The rider calls this number. It isn’t used to sign in."
        error={phoneError}
      >
        <PhoneInput {...form.register('phone')} />
      </Field>
      {otherError ? <Alert tone="danger">{otherError}</Alert> : null}
      {config.isError ? <Alert tone="danger">{errorMessage(config.error)}</Alert> : null}
      <Button type="submit" block loading={complete.isPending} disabled={!config.data}>
        Create account
      </Button>
    </form>
  );
}
