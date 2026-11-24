import {type KeyboardEvent, useEffect, useRef, useState} from 'react';

import {
  CheckCheck,
  ChevronDown,
  Clock,
  GitMerge,
  Hand,
  Link2,
  MessageSquareText,
  Paperclip,
  RotateCcw,
} from 'lucide-react';

import {
  Banner,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Segmented,
  Tag,
  Textarea,
} from '@grov/ui';

import {CustomerCard} from './customer-card';
import {RelateDialog} from './relate-dialog';
import {SAMPLE_MACROS} from './sample-conversations';
import {otherOpen, useSupport} from './support-context';
import {messageTime} from './support-format';
import {
  CATEGORY_LABEL,
  CHANNEL_LABEL,
  type Conversation,
  type SupportMessage,
} from './support-types';

type Mode = 'REPLY' | 'NOTE';
const MODES = [
  {value: 'REPLY', label: 'Reply'},
  {value: 'NOTE', label: 'Internal note'},
] as const satisfies readonly {value: Mode; label: string}[];

/** One conversation: actions, (compact) customer card, thread and the reply box. */
export function ConversationView({
  conversation: c,
  customerClassName,
  className,
}: {
  conversation: Conversation;
  /** Focus mode hides the compact card where the customer has its own pane. */
  customerClassName?: string;
  className?: string;
}) {
  const {me, conversations, send, setStatus, assignToMe, select} = useSupport();
  const [relating, setRelating] = useState(false);
  const merged = c.mergedIntoId ? conversations.find(o => o.id === c.mergedIntoId) : undefined;
  const [mode, setMode] = useState<Mode>('REPLY');
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({block: 'end'});
  }, [c.id, c.messages.length]);

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    send(c.id, body, mode);
    setDraft('');
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submit();
    }
  };
  const firstName = c.customer.name.split(' ')[0] ?? '';

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="grid gap-3 border-b border-line px-4 pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag>{c.number}</Tag>
          <Tag>{CATEGORY_LABEL[c.category]}</Tag>
          <Tag>{CHANNEL_LABEL[c.channel]}</Tag>
          {c.priority === 'HIGH' ? <Tag tone="changed">High</Tag> : null}
        </div>
        <h2 className="text-title-sm">{c.subject}</h2>
        {merged ? null : <Relations conversation={c} />}
        {merged ? (
          <Banner tone="neutral" title={`Merged into ${merged.number}`}>
            Its messages now live in {merged.number}. Reply there.{' '}
            <button
              type="button"
              className="font-semibold text-ink underline underline-offset-2"
              onClick={() => select(merged.id)}
            >
              Open {merged.number}
            </button>
          </Banner>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {c.assignee === me ? (
              <span className="text-body-sm text-ink-muted">Assigned to you</span>
            ) : (
              <Button size="sm" variant="outline" onClick={() => assignToMe(c.id)}>
                <Hand aria-hidden /> {c.assignee ? `Take from ${c.assignee}` : 'Take it'}
              </Button>
            )}
            <div className="ml-auto flex items-center gap-1">
              {c.status === 'RESOLVED' ? (
                <Button size="sm" variant="secondary" onClick={() => setStatus(c.id, 'OPEN')}>
                  <RotateCcw aria-hidden /> Reopen
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => setStatus(c.id, 'RESOLVED')}>
                  <CheckCheck aria-hidden /> Resolve
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-sm" variant="ghost" aria-label="More actions">
                    <ChevronDown aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {c.status === 'RESOLVED' ? null : (
                    <>
                      <DropdownMenuItem
                        disabled={c.status === 'PENDING'}
                        onSelect={() => setStatus(c.id, 'PENDING')}
                      >
                        <Clock aria-hidden /> Waiting on customer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={c.status === 'OPEN'}
                        onSelect={() => setStatus(c.id, 'OPEN')}
                      >
                        <RotateCcw aria-hidden /> Back to open
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onSelect={() => setRelating(true)}>
                    <GitMerge aria-hidden /> Merge or link…
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
        <RelateDialog conversation={c} open={relating} onOpenChange={setRelating} />
        <CustomerCard
          conversation={c}
          compact
          className={cn('rounded-md bg-surface-sunken p-3', customerClassName)}
        />
      </div>

      <ol
        className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto px-4 py-4"
        aria-label="Messages"
      >
        {c.messages.map(m => (
          <Message key={m.id} message={m} />
        ))}
        <li ref={endRef} aria-hidden />
      </ol>

      {merged ? null : (
        <form
          className="grid gap-2 border-t border-line p-3"
          onSubmit={event => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="flex items-center gap-2">
            <Segmented label="Message type" options={MODES} value={mode} onChange={setMode} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="ml-auto" type="button">
                  <MessageSquareText aria-hidden /> Saved replies
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Insert a saved reply</DropdownMenuLabel>
                {SAMPLE_MACROS.map(macro => (
                  <DropdownMenuItem
                    key={macro.id}
                    onSelect={() => {
                      setMode('REPLY');
                      setDraft(macro.body.replaceAll('{firstName}', firstName));
                    }}
                  >
                    {macro.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Textarea
            aria-label={mode === 'REPLY' ? `Reply to ${firstName}` : 'Internal note'}
            placeholder={
              mode === 'REPLY'
                ? `Reply to ${firstName}…`
                : 'Only staff see notes. Mention what you checked or did.'
            }
            value={draft}
            onChange={event => setDraft(event.target.value)}
            onKeyDown={onKey}
            className={cn('min-h-24', mode === 'NOTE' && 'bg-palm-tint')}
          />
          <div className="flex items-center gap-2">
            <span className="text-body-sm text-ink-muted">⌘↵ to send</span>
            <Button
              type="submit"
              size="sm"
              variant={mode === 'REPLY' ? 'primary' : 'secondary'}
              className="ml-auto"
              disabled={!draft.trim()}
            >
              {mode === 'REPLY' ? 'Send reply' : 'Add note'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Message({message: m}: {message: SupportMessage}) {
  if (m.kind === 'EVENT') {
    return (
      <li className="text-center text-body-sm text-ink-muted">
        {m.body} · {messageTime(m.at)}
      </li>
    );
  }
  const staff = m.author === 'STAFF';
  const note = m.kind === 'NOTE';
  return (
    <li className={cn('grid max-w-[85%] gap-1', staff ? 'justify-self-end' : 'justify-self-start')}>
      <span className={cn('text-chip text-ink-muted', staff && 'text-right')}>
        {note ? `${m.authorName} · internal note` : m.authorName} · {messageTime(m.at)}
      </span>
      <div
        className={cn(
          'whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-body',
          note
            ? 'border border-dashed border-palm-strong/40 bg-palm-tint text-ink'
            : staff
              ? 'bg-ink text-canvas'
              : 'bg-surface-sunken text-ink'
        )}
      >
        {m.body}
        {m.attachments?.length ? (
          <ul className="mt-2 grid gap-1">
            {m.attachments.map(name => (
              <li key={name} className="flex items-center gap-1.5 text-body-sm opacity-80">
                <Paperclip aria-hidden className="size-3.5" /> {name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

/**
 * The customer's other threads, so nobody answers one without knowing about the
 * rest: what this follows on from, what's still open, what's linked.
 */
function Relations({conversation: c}: {conversation: Conversation}) {
  const {conversations, select} = useSupport();
  const byId = (id: string) => conversations.find(o => o.id === id);
  const follows = c.followsId ? byId(c.followsId) : undefined;
  const open = otherOpen(conversations, c);
  const linked = (c.relatedIds ?? []).map(byId).filter((o): o is Conversation => Boolean(o));
  if (!follows && open.length === 0 && linked.length === 0) return null;

  const chip = (o: Conversation, extra?: string) => (
    <button
      key={o.id}
      type="button"
      onClick={() => select(o.id)}
      className="inline-flex max-w-full items-center gap-1.5 rounded-pill bg-surface-sunken px-2.5 py-1 text-body-sm text-ink hover:bg-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      <span className="font-semibold">{o.number}</span>
      <span className="truncate">{o.subject}</span>
      {extra ? <span className="shrink-0 text-ink-muted">· {extra}</span> : null}
    </button>
  );

  return (
    <dl className="grid gap-1.5 text-body-sm">
      {open.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <dt className="text-ink-muted">Also open:</dt>
          {open.map(o => (
            <dd key={o.id} className="min-w-0">
              {chip(o, o.assignee ?? 'Unassigned')}
            </dd>
          ))}
        </div>
      ) : null}
      {follows ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <dt className="text-ink-muted">Follows:</dt>
          <dd className="min-w-0">{chip(follows, 'resolved')}</dd>
        </div>
      ) : null}
      {linked.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <dt className="inline-flex items-center gap-1 text-ink-muted">
            <Link2 aria-hidden className="size-3.5" /> Linked:
          </dt>
          {linked.map(o => (
            <dd key={o.id} className="min-w-0">
              {chip(o)}
            </dd>
          ))}
        </div>
      ) : null}
    </dl>
  );
}
