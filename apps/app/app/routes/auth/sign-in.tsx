import {useNavigate, useSearchParams} from 'react-router';

import {useClientConfig} from '@grov/hooks';
import {appConfig, Audience} from '@grov/models';
import {AuthLayout, EmailStep, GoogleSignInButton, safeRedirect} from '@grov/shared';
import {Separator} from '@grov/ui';

import {paths} from '../../paths';
import type {Route} from './+types/sign-in';

export const meta: Route.MetaFunction = () => [{title: `Sign in · ${appConfig.brandName}`}];

/** Welcome: email, or Continue with Google. No guest mode (D37). */
export default function SignIn() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get('redirectTo');
  const config = useClientConfig();
  const {websiteUrl} = appConfig;

  return (
    <AuthLayout
      title={`Welcome to ${appConfig.brandName}`}
      description="Enter your email. We’ll send you a code to sign in or create your account."
      footer={
        <>
          By continuing you agree to our{' '}
          <a className="font-semibold text-ink underline" href={`${websiteUrl}/terms`}>
            Terms
          </a>{' '}
          and{' '}
          <a className="font-semibold text-ink underline" href={`${websiteUrl}/privacy`}>
            Privacy notice
          </a>
          .
        </>
      }
    >
      <div className="grid gap-6">
        <EmailStep redirectTo={redirectTo} onCodeSent={() => navigate(paths.signInCode)} />
        {appConfig.googleClientId ? (
          <>
            <div className="flex items-center gap-3 text-body-sm text-ink-muted">
              <Separator className="flex-1" /> or <Separator className="flex-1" />
            </div>
            <GoogleSignInButton
              audience={Audience.APP}
              termsVersion={config.data?.legal.termsVersion}
              onSignedIn={() => navigate(safeRedirect(redirectTo), {replace: true})}
            />
          </>
        ) : null}
      </div>
    </AuthLayout>
  );
}
