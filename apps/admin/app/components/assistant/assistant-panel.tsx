import {type FormEvent, useEffect, useRef, useState} from 'react';

import {
  ArrowUp,
  Boxes,
  CalendarDays,
  LineChart,
  Plus,
  Sparkles,
  TrendingDown,
  X,
} from 'lucide-react';
import {Link} from 'react-router';

import {Button, cn, IconTile, Input} from '@grov/ui';

import {greetingFor} from '../../lib/dashboard/greeting';
import {useSupport} from '../support';
import {useAssistant} from './assistant-context';

/** Starting points from the plan's assistant (doc 38 §8), each answered from the store's own data. */
const STARTERS = [
  {icon: CalendarDays, title: 'Daily summary', question: 'How did sales do this week?'},
  {icon: Boxes, title: 'Restock', question: 'What should I restock?'},
  {icon: TrendingDown, title: 'Slow movers', question: 'Which products are selling less?'},
  {icon: LineChart, title: 'Margins', question: 'Which products have thin margins?'},
] as const;

export interface AssistantPanelProps {
  className?: string;
}

/**
 * The AI assistant: a conversation with starting points, docked beside the page. It cannot answer
 * yet (no `core/ai`), so it says so and points to the page that holds the numbers.
 */
export function AssistantPanel({className}: AssistantPanelProps) {
  const {messages, ask, close, newConversation} = useAssistant();
  const support = useSupport();
  const [draft, setDraft] = useState('');
  const [now] = useState(() => new Date());
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const started = messages.length > 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView?.({block: 'end'});
  }, [messages]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    ask(draft);
    setDraft('');
  };

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-surface', className)}>
      <header className="flex h-14 shrink-0 items-center gap-1 px-3">
        <h2 className="min-w-0 flex-1 truncate px-1 text-body font-bold">
          {messages[0]?.text ?? 'New conversation'}
        </h2>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="New conversation"
          disabled={!started}
          onClick={newConversation}
        >
          <Plus aria-hidden />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="Close the assistant" onClick={close}>
          <X aria-hidden />
        </Button>
      </header>

      <div className="mx-3 flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2">
        <span className="text-body-sm">Need more help?</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            close();
            support.open();
          }}
        >
          Support
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {started ? (
          <ol className="grid gap-4" aria-live="polite">
            {messages.map(message =>
              message.role === 'user' ? (
                <li key={message.id} className="flex justify-end">
                  <p className="max-w-[85%] rounded-lg bg-surface-sunken px-3 py-2 text-body-sm">
                    {message.text}
                  </p>
                </li>
              ) : (
                <li key={message.id} className="flex gap-2">
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-flame-tint text-flame-strong [&_svg]:size-4"
                  >
                    <Sparkles />
                  </span>
                  <div className="grid min-w-0 flex-1 justify-items-start gap-2">
                    <p className="text-body-sm">{message.text}</p>
                    {message.link ? (
                      <Button asChild size="sm" variant="outline">
                        <Link to={message.link.to}>{message.link.label}</Link>
                      </Button>
                    ) : null}
                  </div>
                </li>
              )
            )}
            <div ref={endRef} />
          </ol>
        ) : (
          <div className="grid gap-6">
            <div className="grid justify-items-center gap-3 pt-6 text-center">
              <IconTile icon={<Sparkles />} size={72} className="rounded-xl" />
              <div className="grid gap-0.5">
                <p className="text-title-sm">{greetingFor(now)}.</p>
                <p className="text-body-sm text-ink-muted">What are we doing today?</p>
              </div>
            </div>
            <ul className="grid gap-2">
              {STARTERS.map(({icon: Icon, title, question}) => (
                <li key={title}>
                  <button
                    type="button"
                    onClick={() => ask(question)}
                    className="flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-ink-muted [&_svg]:size-4"
                    >
                      <Icon />
                    </span>
                    <span className="grid min-w-0">
                      <span className="truncate text-body-sm font-semibold">{title}</span>
                      <span className="truncate text-chip font-normal text-ink-muted">
                        {question}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid shrink-0 gap-2 p-3">
        <p className="rounded-lg bg-surface-sunken px-3 py-2 text-chip font-normal text-ink-muted">
          The assistant isn’t switched on yet. Your questions stay in this window and nothing is
          sent anywhere.
        </p>
        <form onSubmit={submit} className="flex items-center gap-2">
          <Input
            ref={inputRef}
            aria-label="Ask the assistant"
            placeholder="Ask about sales, stock or prices"
            value={draft}
            onChange={event => setDraft(event.target.value)}
          />
          <Button type="submit" size="icon" aria-label="Send" disabled={!draft.trim()}>
            <ArrowUp aria-hidden />
          </Button>
        </form>
      </div>
    </div>
  );
}
