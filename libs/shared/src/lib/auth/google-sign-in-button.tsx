import {GoogleLogin} from '@react-oauth/google';

import {useGoogleSignIn, useProviderNonce} from '@grov/hooks';
import {appConfig, type Audience, type AuthResponse} from '@grov/models';
import {Skeleton, toast, useTheme} from '@grov/ui';

import {errorMessage} from '../errors';

export interface GoogleSignInButtonProps {
  audience: Audience;
  /** Sent when Google creates a new account (Terms are agreed on the sign-in screen). */
  termsVersion?: string;
  onSignedIn: (response: AuthResponse) => void;
}

/**
 * "Continue with Google" (Google Identity Services). The server verifies the ID
 * token and the single-use nonce; the client never trusts Google's profile.
 * Hidden when VITE_GOOGLE_CLIENT_ID is not set.
 */
export function GoogleSignInButton({audience, termsVersion, onSignedIn}: GoogleSignInButtonProps) {
  const enabled = Boolean(appConfig.googleClientId);
  const nonce = useProviderNonce(enabled);
  const signIn = useGoogleSignIn(audience);
  const {resolved} = useTheme();

  if (!enabled) return null;
  if (nonce.isPending) return <Skeleton className="h-12 w-full rounded-pill" />;

  return (
    <div className="flex justify-center" aria-busy={signIn.isPending || undefined}>
      <GoogleLogin
        nonce={nonce.data?.nonce}
        theme={resolved === 'dark' ? 'filled_black' : 'outline'}
        shape="pill"
        size="large"
        text="continue_with"
        width="320"
        onSuccess={({credential}) => {
          if (!credential) return;
          signIn.mutate(
            {idToken: credential, nonce: nonce.data?.nonce, termsVersion},
            {
              onSuccess: onSignedIn,
              onError: error => {
                toast.error(errorMessage(error, 'Google sign-in didn’t go through. Try again.'));
                void nonce.refetch();
              },
            }
          );
        }}
        onError={() => toast.error('Google sign-in didn’t go through. Try again.')}
      />
    </div>
  );
}
