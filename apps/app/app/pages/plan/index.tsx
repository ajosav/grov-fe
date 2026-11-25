import {Sparkles} from 'lucide-react';

import {appConfig} from '@grov/models';
import {PageHeader} from '@grov/shared';
import {Card, EmptyState} from '@grov/ui';

import type {Route} from './+types/index';

export const meta: Route.MetaFunction = () => [{title: `Plan · ${appConfig.brandName}`}];

/** Placeholder until the Plan screens are built (see the design skill for the spec). */
export default function Plan() {
  return (
    <>
      <PageHeader title="Plan" description="Your household’s food for the month." />
      <Card>
        <EmptyState
          icon={<Sparkles />}
          title="No plan yet"
          description="Tell us who you feed and your budget, and we’ll build a month of food."
        />
      </Card>
    </>
  );
}
