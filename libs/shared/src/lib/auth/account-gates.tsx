import {useState} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {z} from 'zod';

import {
  useAcceptConsent,
  useClientConfig,
  useCompletePhone,
  useCountdown,
  useMe,
  useResendEmailCode,
  useVerifyEmail,
} from '@grov/hooks';
import {Gate, type OtpChallengeSummary} from '@grov/models';
import {Alert, Button, Field, OtpInput, PhoneInput, toast, toE164Nigeria} from '@grov/ui';

import {errorMessage} from '../errors';

export interface AccountGatesProps {
  /** Links to the legal pages, shown with the terms gate. */
  termsHref: string;
  privacyHref: string;
  onSignOut: () => void;
}

/**
 * Clears what grov-be still needs before the account can be used (`Me.gates`):
 * verify email, add phone (after Google sign-up), accept new terms. One gate at
 * a time; `/v1/me` is reloaded after each.
 */
export function AccountGates({termsHref, privacyHref, onSignOut}: AccountGatesProps) {
  const {data: me} = useMe();
  if (!me) return null;
  const gate = me.gates[0];

  switch (gate) {
    case Gate.VERIFY_EMAIL:
      return <VerifyEmailGate email={me.email} />;
    case Gate.ADD_PHONE:
      return <AddPhoneGate />;
    case Gate.ACCEPT_TERMS:
      return <AcceptTermsGate termsHref={termsHref} privacyHref={privacyHref} />;
    case Gate.MFA:
    case Gate.MFA_ENROL:
      return (
        <div className="grid gap-4">
          <Alert tone="warning" title="Two-step sign-in is needed">
            The authenticator step isn’t available in this console yet. Ask the platform team to
            finish it, then sign in again.
          </Alert>
          <Button variant="outline" onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      );
    default:
      return null;
  }
}

function VerifyEmailGate({email}: {email: string}) {
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<OtpChallengeSummary | null>(null);
  const verify = useVerifyEmail();
  const resend = useResendEmailCode();
  const wait = useCountdown(challenge?.nextSendAt);
  const submit = (value: string) => {
    if (value.length === 6) verify.mutate(value, {onError: () => setCode('')});
  };
  return (
    <div className="grid gap-5">
      <p className="text-body text-ink-muted">
        Enter the 6-digit code we sent to <span className="font-semibold text-ink">{email}</span>.
      </p>
      <OtpInput
        value={code}
        onChange={value => {
          setCode(value);
          submit(value);
        }}
        aria-label="6-digit code"
        autoFocus
      />
      {verify.isError ? <Alert tone="danger">{errorMessage(verify.error)}</Alert> : null}
      <Button
        variant="ghost"
        disabled={wait > 0 || resend.isPending}
        onClick={() =>
          resend.mutate(undefined, {
            onSuccess: next => {
              setChallenge(next);
              toast.success('New code sent');
            },
            onError: error => toast.error(errorMessage(error)),
          })
        }
      >
        {wait > 0 ? `Send a new code in ${wait}s` : 'Send a new code'}
      </Button>
    </div>
  );
}

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .refine(
      value => toE164Nigeria(value) !== null,
      'Enter a Nigerian phone number, like 0803 123 4567'
    ),
});

function AddPhoneGate() {
  const completePhone = useCompletePhone();
  const form = useForm({resolver: zodResolver(phoneSchema), defaultValues: {phone: ''}});
  const submit = form.handleSubmit(({phone}) =>
    completePhone.mutate(toE164Nigeria(phone) ?? phone, {
      onError: error => form.setError('phone', {message: errorMessage(error)}),
    })
  );
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <p className="text-body text-ink-muted">
        Add your phone number. The rider calls it on delivery day; it isn’t used to sign in.
      </p>
      <Field label="Phone" error={form.formState.errors.phone?.message}>
        <PhoneInput autoFocus {...form.register('phone')} />
      </Field>
      <Button type="submit" block loading={completePhone.isPending}>
        Continue
      </Button>
    </form>
  );
}

function AcceptTermsGate({termsHref, privacyHref}: {termsHref: string; privacyHref: string}) {
  const config = useClientConfig();
  const accept = useAcceptConsent();
  const version = config.data?.legal.termsVersion;
  return (
    <div className="grid gap-4">
      <p className="text-body text-ink-muted">
        Our{' '}
        <a
          href={termsHref}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-ink underline"
        >
          Terms
        </a>{' '}
        and{' '}
        <a
          href={privacyHref}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-ink underline"
        >
          Privacy notice
        </a>{' '}
        changed. Read and accept them to carry on.
      </p>
      {accept.isError ? <Alert tone="danger">{errorMessage(accept.error)}</Alert> : null}
      <Button
        block
        disabled={!version}
        loading={accept.isPending}
        onClick={() => version && accept.mutate({kind: 'TERMS', version})}
      >
        I accept
      </Button>
    </div>
  );
}
