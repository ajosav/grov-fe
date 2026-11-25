import {useState} from 'react';

import {Search, X} from 'lucide-react';

import type {AuditFacets} from '@grov/models';
import {Combobox, Input} from '@grov/ui';

import {SYSTEM_ACTOR} from '../../lib/audit/filters';

export interface AuditToolbarProps {
  /** What was typed, so the box keeps showing it after a reload. */
  search: string;
  onSearch: (text: string) => void;
  /** The person the list is narrowed to: a user id, `system`, or null for everyone. */
  person: string | null;
  onPerson: (value: string | null) => void;
  facets: AuditFacets | undefined;
}

/** Free-text search and a person picker, next to the period. */
export function AuditToolbar({search, onSearch, person, onPerson, facets}: AuditToolbarProps) {
  const [text, setText] = useState(search);
  const options = [
    {value: SYSTEM_ACTOR, label: 'System (automatic)'},
    ...(facets?.actors.map(a => ({
      value: a.value,
      label: a.label === a.email ? a.email : `${a.label} · ${a.email}`,
      keywords: [a.email, a.label],
    })) ?? []),
  ];
  // A person picked for another period may have no entries in this one; keep them shown.
  if (person && !options.some(o => o.value === person)) {
    options.push({value: person, label: 'Selected person'});
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-72">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
        />
        <Input
          type="search"
          aria-label="Search the audit log"
          placeholder="Search person, action, record or ID"
          value={text}
          onChange={event => {
            setText(event.target.value);
            onSearch(event.target.value);
          }}
          className="h-10 pr-9 pl-9"
        />
        {text ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setText('');
              onSearch('');
            }}
            className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-pill text-ink-muted hover:bg-surface-sunken hover:text-ink"
          >
            <X aria-hidden className="size-4" />
          </button>
        ) : null}
      </div>
      <Combobox
        value={person}
        onChange={onPerson}
        options={options}
        placeholder="All people"
        searchPlaceholder="Search people"
        emptyText="No one with entries in this period."
        className="h-10 w-full sm:w-64"
      />
    </div>
  );
}
