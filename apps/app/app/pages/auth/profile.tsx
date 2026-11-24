import {useNavigate} from 'react-router';

import {appConfig} from '@grov/models';
import {AuthLayout, ProfileStep, safeRedirect} from '@grov/shared';
import {useSignInStore} from '@grov/store';

import {paths} from '../../paths';
import type {Route} from './+types/profile';

export const meta: Route.MetaFunction = () => [
  {title: `Create your account · ${appConfig.brandName}`},
];

export default function Profile() {
  const navigate = useNavigate();
  const redirectTo = useSignInStore(s => s.redirectTo);
  const reset = useSignInStore(s => s.reset);

  return (
    <AuthLayout
      title="A little about you"
      description="Phone is required: it’s the number the rider calls."
    >
      <ProfileStep
        onDone={() => {
          const to = safeRedirect(redirectTo);
          reset();
          navigate(to, {replace: true});
        }}
        onRestart={() => navigate(paths.signIn, {replace: true})}
      />
    </AuthLayout>
  );
}
