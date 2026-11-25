import {Link} from 'react-router';

import {Alert, Button} from '@grov/ui';

import {paths} from '../../paths';

/** A missing, expired or already-used invite link. */
export function InviteLinkProblem({message}: {message: string}) {
  return (
    <div className="grid gap-4">
      <Alert tone="warning" title="Can’t use this invite">
        {message}
      </Alert>
      <Button asChild variant="outline">
        <Link to={paths.signIn}>Go to sign in</Link>
      </Button>
    </div>
  );
}
