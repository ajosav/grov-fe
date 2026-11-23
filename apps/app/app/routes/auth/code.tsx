import {useNavigate} from 'react-router';

import {appConfig} from '@grov/models';
import {AuthLayout, CodeStep, safeRedirect} from '@grov/shared';
import {useSignInStore} from '@grov/store';

import {paths} from '../../paths';
import type {Route} from './+types/code';

export const meta: Route.MetaFunction = () => [{title: `Enter your code · ${appConfig.brandName}`}];

export default function Code() {
  const navigate = useNavigate();
  const redirectTo = useSignInStore(s => s.redirectTo);
  const reset = useSignInStore(s => s.reset);

  return (
    <AuthLayout title="Check your email" description="The code works for 10 minutes.">
      <CodeStep
        onSignedIn={() => {
          const to = safeRedirect(redirectTo);
          reset();
          navigate(to, {replace: true});
        }}
        onProfileRequired={() => navigate(paths.signInProfile, {replace: true})}
        onChangeEmail={() => navigate(paths.signIn)}
      />
    </AuthLayout>
  );
}
