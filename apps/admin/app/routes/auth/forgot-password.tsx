import {Link} from 'react-router';

import {appConfig} from '@grov/models';
import {AuthLayout, ForgotPasswordForm} from '@grov/shared';

import {paths} from '../../paths';
import type {Route} from './+types/forgot-password';

export const meta: Route.MetaFunction = () => [
  {title: `Reset your password · ${appConfig.brandName} admin`},
];

export default function ForgotPassword() {
  return (
    <AuthLayout
      badge="Admin"
      title="Reset your password"
      description="We’ll email you a link to set a new one."
      footer={
        <Link to={paths.signIn} className="font-semibold text-ink underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
