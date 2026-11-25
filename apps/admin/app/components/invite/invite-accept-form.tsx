import type {ReactNode} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {Link, useNavigate} from 'react-router';

import {isApiError} from '@grov/api';
import {useAcceptInvite, useClientConfig} from '@grov/hooks';
import {appConfig, type InviteCheck} from '@grov/models';
import {applyFieldErrors, errorMessage} from '@grov/shared';
import {
  Alert,
  Button,
  Checkbox,
  Field,
  Input,
  PasswordInput,
  PhoneInput,
  toE164Nigeria,
} from '@grov/ui';

import {paths} from '../../paths';
import {inviteSchemaFor, type InviteValues, type Mode} from './accept-invite.schema';

interface InviteAcceptFormProps {
  token: string;
  invite: InviteCheck;
}

/** What the invite grants, then the password (and, for a new account, the profile) to accept it. */
export function InviteAcceptForm({token, invite}: InviteAcceptFormProps) {
  const navigate = useNavigate();
  const accept = useAcceptInvite();
  const config = useClientConfig();
  const mode: Mode = !invite.account.exists
    ? 'NEW'
    : invite.account.hasPassword
      ? 'EXISTING'
      : 'CHOOSE';
  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchemaFor(mode)),
    defaultValues: {
      password: '',
      confirm: '',
      firstName: '',
      lastName: '',
      phone: '',
      terms: false,
    },
  });
  const errors = form.formState.errors;

  const submit = form.handleSubmit(values => {
    const password = values.password;
    accept.mutate(
      mode === 'NEW'
        ? {
            token,
            password,
            firstName: values.firstName.trim(),
            ...(values.lastName.trim() ? {lastName: values.lastName.trim()} : {}),
            phone: toE164Nigeria(values.phone) ?? values.phone,
            termsVersion: config.data?.legal.termsVersion,
          }
        : {token, password},
      {
        onSuccess: () => navigate(paths.dashboard, {replace: true}),
        onError: error => {
          if (!isApiError(error)) return;
          applyFieldErrors(form, error);
        },
      }
    );
  });

  const scope = invite.allStores
    ? 'All stores'
    : invite.stores.length > 0
      ? invite.stores.join(', ')
      : 'No store yet';

  return (
    <div className="grid gap-5">
      <dl className="grid gap-2 rounded-md border border-line p-4 text-body-sm">
        <Row label="For">{invite.email}</Row>
        {invite.invitedByName ? <Row label="Invited by">{invite.invitedByName}</Row> : null}
        <Row label="Roles">{invite.roles.join(', ') || 'None'}</Row>
        <Row label="Stores">{scope}</Row>
      </dl>

      <form onSubmit={submit} noValidate className="grid gap-4">
        {mode === 'EXISTING' ? (
          <p className="text-body-sm text-ink-muted">
            You already have an account
            {invite.account.firstName ? `, ${invite.account.firstName}` : ''}. Enter its password to
            accept.
          </p>
        ) : mode === 'CHOOSE' ? (
          <p className="text-body-sm text-ink-muted">
            You already have an account
            {invite.account.firstName ? `, ${invite.account.firstName}` : ''}. Choose a password for
            the admin console. You can keep signing in to the app with your email code.
          </p>
        ) : null}

        {mode === 'NEW' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" error={errors.firstName?.message}>
                <Input autoComplete="given-name" {...form.register('firstName')} />
              </Field>
              <Field label="Last name" optional error={errors.lastName?.message}>
                <Input autoComplete="family-name" {...form.register('lastName')} />
              </Field>
            </div>
            <Field label="Phone" error={errors.phone?.message}>
              <PhoneInput autoComplete="tel-national" {...form.register('phone')} />
            </Field>
          </>
        ) : null}

        <Field
          label={mode === 'EXISTING' ? 'Password' : 'Choose a password'}
          hint={mode === 'EXISTING' ? undefined : 'At least 8 characters with a symbol.'}
          error={errors.password?.message}
        >
          <PasswordInput
            autoComplete={mode === 'EXISTING' ? 'current-password' : 'new-password'}
            {...form.register('password')}
          />
        </Field>
        {mode === 'CHOOSE' ? (
          <Field label="Confirm password" error={errors.confirm?.message}>
            <PasswordInput autoComplete="new-password" {...form.register('confirm')} />
          </Field>
        ) : null}

        {mode === 'NEW' ? (
          <div className="grid gap-1">
            <div className="flex items-start gap-3">
              <Checkbox
                id="invite-terms"
                checked={form.watch('terms')}
                onCheckedChange={on => form.setValue('terms', on === true, {shouldValidate: true})}
                className="mt-0.5"
              />
              <label htmlFor="invite-terms" className="text-body-sm">
                I accept the{' '}
                <a
                  href={`${appConfig.websiteUrl}/terms`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4"
                >
                  terms
                </a>{' '}
                and{' '}
                <a
                  href={`${appConfig.websiteUrl}/privacy`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4"
                >
                  privacy policy
                </a>
                .
              </label>
            </div>
            {errors.terms?.message ? (
              <p role="alert" className="text-body-sm text-danger">
                {errors.terms.message}
              </p>
            ) : null}
          </div>
        ) : null}

        {accept.isError ? <Alert tone="danger">{errorMessage(accept.error)}</Alert> : null}
        <Button type="submit" block loading={accept.isPending}>
          Accept and sign in
        </Button>
        {mode === 'EXISTING' ? (
          <Link
            to={paths.forgotPassword}
            className="text-center text-body-sm text-ink-muted underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>
        ) : null}
      </form>
    </div>
  );
}

function Row({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="break-words font-semibold">{children}</dd>
    </div>
  );
}
