import {NavLink} from 'react-router';

import {cn} from '@grov/ui';

import {paths} from '../../../paths';

/** The three linked Product management views. */
export function ProductsSectionNav() {
  const tabs = [
    {to: paths.products, label: 'Catalogue', end: true},
    {to: paths.productAnalytics, label: 'Analytics'},
    {to: paths.productIntelligence, label: 'Intelligence'},
  ];
  return (
    <nav aria-label="Product management" className="mb-5 border-b border-line">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {tabs.map(tab => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({isActive}) =>
                cn(
                  'inline-flex h-10 items-center whitespace-nowrap border-b-2 px-3 text-body-sm font-semibold transition-colors',
                  isActive
                    ? 'border-flame text-ink'
                    : 'border-transparent text-ink-muted hover:text-ink'
                )
              }
            >
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
