import {lazy, Suspense} from 'react';

import {Skeleton} from '@grov/ui';

import type {StoreMapProps} from './store-map';

// MapLibre and the drawing tools are large; load them only on pages with a map.
const StoreMap = lazy(() => import('./store-map').then(module => ({default: module.StoreMap})));

export function LazyStoreMap(props: StoreMapProps) {
  return (
    <Suspense
      fallback={<Skeleton className={props.className ?? 'h-full min-h-80 w-full rounded-md'} />}
    >
      <StoreMap {...props} />
    </Suspense>
  );
}
