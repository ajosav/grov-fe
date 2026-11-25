import {appConfig} from '@grov/models';
import {RouteErrorContent} from '@grov/shared';
import {DesignSystemGallery} from '@grov/ui';

import type {Route} from './+types/design-system';

export const meta: Route.MetaFunction = () => [
  {title: `Design system · ${appConfig.brandName}`},
  {name: 'robots', content: 'noindex, nofollow'},
];

export default function DesignSystem() {
  return appConfig.showDesignSystem ? <DesignSystemGallery /> : <RouteErrorContent />;
}
