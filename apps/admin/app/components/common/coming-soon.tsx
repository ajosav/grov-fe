import {Construction, Store} from 'lucide-react';

import {useMyStores} from '@grov/hooks';
import {PageHeader} from '@grov/shared';
import {Banner, Card, EmptyState} from '@grov/ui';

export interface ComingSoonProps {
  title: string;
  description: string;
  storeScoped?: boolean;
}

export function ComingSoon({title, description, storeScoped}: ComingSoonProps) {
  const stores = useMyStores();
  const active = stores.data?.stores.find(s => s.id === stores.data?.activeStoreId);
  return (
    <>
      <PageHeader title={title} description={description} />
      {storeScoped ? (
        <Banner
          tone="neutral"
          icon={<Store aria-hidden />}
          className="mb-6"
          title={active ? `Showing ${active.name}` : 'Choose a store first'}
        >
          {active
            ? 'This page works in one store at a time. Change it from the store menu at the top of the sidebar.'
            : 'This page works in one store at a time. Pick one from the store menu at the top of the sidebar.'}
        </Banner>
      ) : null}
      <Card>
        <EmptyState
          icon={<Construction aria-hidden />}
          title="Not built yet"
          description="This page has its place in the console. Its screens come next."
        />
      </Card>
    </>
  );
}
