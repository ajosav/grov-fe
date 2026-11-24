import {useRef, useState} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {z} from 'zod';

import {
  useForgotPassword,
  usePasswordSignIn,
  useResetLinkCheck,
  useResetPassword,
} from '@grov/hooks';
import {type Audience, type AuthResponse} from '@grov/models';
import {Alert, Button, Field, Input, PasswordInput, Skeleton} from '@grov/ui';

import {errorMessage} from '../errors';
import {isTurnstileEnabled, Turnstile, type TurnstileHandle} from './turnstile';

/* -------------------------------------------------------------- sign in */

const signInSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export interface PasswordSignInFormProps {
  audience: Audience;
  onSignedIn: (response: AuthResponse) => void;
  forgotPasswordHref: string;
}

/** Email + password. grov-be accepts passwords for the admin console only. */
export function PasswordSignInForm({
  audience,
  onSignedIn,
  forgotPasswordHref,
}: PasswordSignInFormProps) {
  const signIn = usePasswordSignIn(audience);
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {email: '', password: ''},
  });
  const submit = form.handleSubmit(values => signIn.mutate(values, {onSuccess: onSignedIn}));
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      {signIn.isError ? <Alert tone="danger">{errorMessage(signIn.error)}</Alert> : null}
      <Field label="Email" error={form.formState.errors.email?.message}>
        <Input type="email" autoComplete="username" autoFocus {...form.register('email')} />
      </Field>
      <Field label="Password" error={form.formState.errors.password?.message}>
        <PasswordInput autoComplete="current-password" {...form.register('password')} />
      </Field>
      <div className="-mt-1 flex justify-end">
        <a
          href={forgotPasswordHref}
          className="text-body-sm font-semibold text-ink underline underline-offset-4"
        >
          Forgot password?
        </a>
      </div>
      <Button type="submit" block loading={signIn.isPending}>
        Sign in
      </Button>
    </form>
  );
}

/* ------------------------------------------------------- forgot password */

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const turnstile = useRef<TurnstileHandle>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(z.object({email: z.email('Enter a valid email address')})),
    defaultValues: {email: ''},
  });
  if (forgot.isSuccess) {
    return (
      <Alert tone="success" title="Check your email">
        If {form.getValues('email')} has an account, a reset link is on its way. It works for 30
        minutes.
      </Alert>
    );
  }
  return (
    <form
      onSubmit={form.handleSubmit(values =>
        forgot.mutate(
          {...values, captchaToken: captchaToken ?? undefined},
          {onSettled: () => turnstile.current?.reset()}
        )
      )}
      noValidate
      className="grid gap-4"
    >
      <Field label="Email" error={form.formState.errors.email?.message}>
        <Input type="email" autoComplete="email" autoFocus {...form.register('email')} />
      </Field>
      <Turnstile ref={turnstile} action="password-reset" onToken={setCaptchaToken} />
      {forgot.isError ? <Alert tone="danger">{errorMessage(forgot.error)}</Alert> : null}
      <Button
        type="submit"
        block
        loading={forgot.isPending}
        disabled={isTurnstileEnabled() && !captchaToken}
      >
        Send reset link
      </Button>
    </form>
  );
}

/* -------------------------------------------------------- reset password */

/** Mirrors grov-be's policy for the live hint; the server is the authority (PASSWORD_WEAK / COMMON). */
export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(128)
  .regex(/[^A-Za-z0-9]/, 'Add at least one symbol, like ! or #');

const resetSchema = z
  .object({password: passwordSchema, confirm: z.string()})
  .refine(v => v.password === v.confirm, {path: ['confirm'], message: 'Passwords don’t match'});

export interface ResetPasswordFormProps {
  token: string | null;
  onDone: (response: AuthResponse) => void;
  forgotPasswordHref: string;
}

export function ResetPasswordForm({token, onDone, forgotPasswordHref}: ResetPasswordFormProps) {
  const check = useResetLinkCheck(token);
  const reset = useResetPassword();
  const form = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {password: '', confirm: ''},
  });

  if (!token)
    return <LinkProblem message="This reset link is incomplete." href={forgotPasswordHref} />;
  if (check.isPending) return <Skeleton className="h-40" />;
  if (check.isError || !check.data?.valid) {
    return (
      <LinkProblem
        message={errorMessage(check.error, 'This link has expired.')}
        href={forgotPasswordHref}
      />
    );
  }

  const submit = form.handleSubmit(({password}) =>
    reset.mutate({token, password}, {onSuccess: onDone})
  );
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <Field
        label="New password"
        hint="At least 8 characters with a symbol."
        error={form.formState.errors.password?.message}
      >
        <PasswordInput autoComplete="new-password" autoFocus {...form.register('password')} />
      </Field>
      <Field label="Confirm password" error={form.formState.errors.confirm?.message}>
        <PasswordInput autoComplete="new-password" {...form.register('confirm')} />
      </Field>
      {reset.isError ? <Alert tone="danger">{errorMessage(reset.error)}</Alert> : null}
      <Button type="submit" block loading={reset.isPending}>
        Set password and sign in
      </Button>
    </form>
  );
}

function LinkProblem({message, href}: {message: string; href: string}) {
  return (
    <div className="grid gap-4">
      <Alert tone="warning" title="Can’t use this link">
        {message}
      </Alert>
      <Button asChild variant="outline">
        <a href={href}>Ask for a new link</a>
      </Button>
    </div>
  );
}
