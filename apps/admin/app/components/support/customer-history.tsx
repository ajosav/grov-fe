import {useState} from 'react';

import {format} from 'date-fns';
import {Pencil, Pin} from 'lucide-react';

import {Button, cn, Tag, Textarea} from '@grov/ui';

import {customerConversations, useSupport} from './support-context';
import {type Conversation, STATUS_LABEL} from './support-types';

/**
 * Every conversation this customer has had, open first. The current one is
 * marked; the others open in place.
 */
export function CustomerHistory({
  conversation,
  className,
}: {
  conversation: Conversation;
  className?: string;
}) {
  const {conversations, select} = useSupport();
  const all = customerConversations(conversations, conversation.customer.id);
  const numberOf = (id?: string) => conversations.find(c => c.id === id)?.number;

  return (
    <ol className={cn('grid gap-1', className)} aria-label="Conversations with this customer">
      {all.map(c => {
        const current = c.id === conversation.id;
        return (
          <li key={c.id}>
            <button
              type="button"
              disabled={current}
              aria-current={current ? 'true' : undefined}
              onClick={() => select(c.id)}
              className={cn(
                'grid w-full gap-0.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                current && 'bg-surface-sunken hover:bg-surface-sunken'
              )}
            >
              <span className="flex items-center gap-2 text-body-sm text-ink-muted">
                <span className="font-semibold text-ink">{c.number}</span>
                <span>{format(new Date(c.createdAt), 'dd/MM/yyyy')}</span>
                {current ? <span className="ml-auto">This one</span> : null}
              </span>
              <span className="truncate text-body text-ink">{c.subject}</span>
              <span className="flex flex-wrap items-center gap-1.5">
                {c.mergedIntoId ? (
                  <Tag>Merged into {numberOf(c.mergedIntoId)}</Tag>
                ) : (
                  <Tag
                    tone={
                      c.status === 'OPEN' ? 'changed' : c.status === 'PENDING' ? 'info' : 'success'
                    }
                  >
                    {STATUS_LABEL[c.status]}
                  </Tag>
                )}
                <span className="text-chip text-ink-muted">{c.assignee ?? 'Unassigned'}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** A staff note pinned to the customer, shown on all of their conversations. */
export function CustomerNote({customerId, firstName}: {customerId: string; firstName: string}) {
  const {customerNotes, setCustomerNote} = useSupport();
  const note = customerNotes[customerId] ?? '';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);

  if (editing) {
    return (
      <form
        className="grid gap-2"
        onSubmit={event => {
          event.preventDefault();
          setCustomerNote(customerId, draft);
          setEditing(false);
        }}
      >
        <Textarea
          autoFocus
          aria-label={`Note about ${firstName}`}
          value={draft}
          onChange={event => setDraft(event.target.value)}
          placeholder="Staff only. Shows on every conversation with this customer."
          className="min-h-20 bg-palm-tint"
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setDraft(note);
              setEditing(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" variant="secondary">
            Save note
          </Button>
        </div>
      </form>
    );
  }

  if (!note) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft('');
          setEditing(true);
        }}
        className="flex items-center gap-2 self-start rounded-md px-1 text-body-sm text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Pin aria-hidden className="size-3.5" /> Pin a note about {firstName}
      </button>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-md border border-dashed border-palm-strong/40 bg-palm-tint px-3 py-2">
      <Pin aria-hidden className="mt-0.5 size-3.5 shrink-0 text-palm-strong" />
      <p className="min-w-0 flex-1 text-body-sm text-ink">
        <span className="sr-only">Pinned note: </span>
        {note}
      </p>
      <button
        type="button"
        aria-label="Edit pinned note"
        onClick={() => {
          setDraft(note);
          setEditing(true);
        }}
        className="text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Pencil aria-hidden className="size-3.5" />
      </button>
    </div>
  );
}
