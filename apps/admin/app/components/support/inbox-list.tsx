import {Mail, MessageCircle, Smartphone} from 'lucide-react';

import {Avatar, cn, EmptyState, Segmented, Tag} from '@grov/ui';

import {filterInbox, type InboxView, otherOpen, useSupport} from './support-context';
import {ago, dueLabel} from './support-format';
import type {Conversation, ConversationChannel} from './support-types';

const VIEWS = [
  {value: 'mine', label: 'Mine'},
  {value: 'unassigned', label: 'Unassigned'},
  {value: 'all', label: 'All'},
] as const satisfies readonly {value: InboxView; label: string}[];

const CHANNEL_ICON: Record<ConversationChannel, typeof Mail> = {
  IN_APP: Smartphone,
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
};

/** Conversation list with Mine / Unassigned / All. Used by the panel and focus mode. */
export function InboxList({className}: {className?: string}) {
  const {conversations, view, setView, me, selectedId, select} = useSupport();
  const shown = filterInbox(conversations, view, me);

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="px-4 pb-3">
        <Segmented
          label="Which conversations"
          options={VIEWS}
          value={view}
          onChange={setView}
          className="w-full [&>button]:flex-1"
        />
      </div>
      {shown.length === 0 ? (
        <EmptyState title="Nothing here" description="New requests from customers show up here." />
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-3" aria-label="Conversations">
          {shown.map(c => (
            <li key={c.id}>
              <Row
                conversation={c}
                otherOpenCount={c.status === 'RESOLVED' ? 0 : otherOpen(conversations, c).length}
                active={c.id === selectedId}
                onOpen={() => select(c.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({
  conversation: c,
  otherOpenCount,
  active,
  onOpen,
}: {
  conversation: Conversation;
  /** The same customer's other open conversations. */
  otherOpenCount: number;
  active: boolean;
  onOpen: () => void;
}) {
  const last = [...c.messages].reverse().find(m => m.kind !== 'EVENT');
  const due = dueLabel(c.dueAt);
  const Channel = CHANNEL_ICON[c.channel];
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'grid w-full grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-3 py-3 text-left transition-colors hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        active && 'bg-surface-sunken'
      )}
    >
      <span className="relative">
        <Avatar name={c.customer.name} className="size-9 text-body" />
        {c.unread ? (
          <span className="absolute -right-0.5 -top-0.5 size-3 rounded-pill border-2 border-surface bg-flame">
            <span className="sr-only">New message</span>
          </span>
        ) : null}
      </span>
      <span className="grid min-w-0 gap-0.5">
        <span className="flex items-baseline gap-2">
          <span
            className={cn('truncate text-body', c.unread ? 'font-bold text-ink' : 'font-semibold')}
          >
            {c.customer.name}
          </span>
          <span className="ml-auto shrink-0 text-body-sm text-ink-muted">
            {last ? ago(last.at) : ''}
          </span>
        </span>
        <span className="truncate text-body-sm text-ink">{c.subject}</span>
        <span className="truncate text-body-sm text-ink-muted">
          {last?.kind === 'NOTE' ? 'Note: ' : last?.author === 'STAFF' ? 'You: ' : ''}
          {last?.body}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <Channel aria-label={c.channel} className="size-3.5 text-ink-muted" />
          {c.status === 'OPEN' ? (
            <Tag tone={due.late ? 'changed' : 'neutral'}>{due.text}</Tag>
          ) : (
            <Tag tone={c.status === 'RESOLVED' ? 'success' : 'info'}>
              {c.status === 'RESOLVED' ? 'Resolved' : 'Waiting on customer'}
            </Tag>
          )}
          {c.priority === 'HIGH' ? <Tag tone="changed">High</Tag> : null}
          {otherOpenCount ? (
            <Tag tone="info">
              +{otherOpenCount} open
              <span className="sr-only"> from this customer</span>
            </Tag>
          ) : null}
          <span className="text-chip text-ink-muted">
            {c.assignee ? `· ${c.assignee}` : '· Unassigned'}
          </span>
        </span>
      </span>
    </button>
  );
}
