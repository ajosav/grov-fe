import {useNavigate, useSearchParams} from 'react-router';

import {appConfig} from '@grov/models';
import {AuthLayout, ResetPasswordForm} from '@grov/shared';

import {paths} from '../../paths';
import type {Route} from './+types/reset-password';

export const meta: Route.MetaFunction = () => [
  {title: `Set a new password · ${appConfig.brandName} admin`},
];

/** Opened from the reset email: `/reset-password?t=<token>`. Signs out every other session. */
export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  return (
    <AuthLayout
      badge="Admin"
      title="Set a new password"
      description="This signs you out on every other device."
    >
      <ResetPasswordForm
        token={params.get('t') ?? params.get('token')}
        forgotPasswordHref={paths.forgotPassword}
        onDone={() => navigate(paths.dashboard, {replace: true})}
      />
    </AuthLayout>
  );
}
