import {useNavigate, useSearchParams} from 'react-router';

import {appConfig, Audience} from '@grov/models';
import {AuthLayout, GoogleSignInButton, PasswordSignInForm, safeRedirect} from '@grov/shared';
import {Separator} from '@grov/ui';

import {paths} from '../../paths';
import type {Route} from './+types/sign-in';

export const meta: Route.MetaFunction = () => [{title: `Sign in · ${appConfig.brandName} admin`}];

export default function SignIn() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const done = () => navigate(safeRedirect(params.get('redirectTo')), {replace: true});

  return (
    <AuthLayout
      badge="Admin"
      title="Sign in to the admin console"
      description="Use the account you were invited with."
      tagline="Stores, prices, stock and orders, in one place."
    >
      <div className="grid gap-6">
        <PasswordSignInForm
          audience={Audience.ADMIN}
          onSignedIn={done}
          forgotPasswordHref={paths.forgotPassword}
        />
        {appConfig.googleClientId ? (
          <>
            <div className="flex items-center gap-3 text-body-sm text-ink-muted">
              <Separator className="flex-1" /> or <Separator className="flex-1" />
            </div>
            <GoogleSignInButton audience={Audience.ADMIN} onSignedIn={done} />
          </>
        ) : null}
      </div>
    </AuthLayout>
  );
}
