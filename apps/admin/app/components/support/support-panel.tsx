import {ArrowLeft, Maximize2, PanelRightClose, PanelRightOpen, X} from 'lucide-react';
import {Link, useLocation} from 'react-router';

import {Button, cn} from '@grov/ui';

import {paths} from '../../paths';
import {ConversationView} from './conversation-view';
import {InboxList} from './inbox-list';
import {useSupport} from './support-context';

/**
 * The support panel: inbox list, or one conversation with the customer beside
 * it. Shown as a peek sheet over the page, or docked as a rail next to it.
 */
export function SupportPanel({canDock, className}: {canDock: boolean; className?: string}) {
  const {mode, conversations, selectedId, select, close, togglePin, waitingCount} = useSupport();
  const selected = conversations.find(c => c.id === selectedId);
  const docked = mode === 'docked';
  const {pathname, search} = useLocation();

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-surface', className)}>
      <header className="flex h-14 shrink-0 items-center gap-1 px-3">
        {selected ? (
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Back to inbox"
            onClick={() => select(null)}
          >
            <ArrowLeft aria-hidden />
          </Button>
        ) : null}
        <h2 className="min-w-0 flex-1 truncate px-1 text-body font-bold">
          {selected ? selected.customer.name : 'Inbox'}
          {!selected && waitingCount ? (
            <span className="ml-2 font-normal text-ink-muted">{waitingCount} waiting</span>
          ) : null}
        </h2>
        <Button size="icon-sm" variant="ghost" asChild aria-label="Open full inbox">
          <Link
            to={selected ? `${paths.support}?c=${selected.id}` : paths.support}
            state={{from: pathname + search}}
            onClick={close}
          >
            <Maximize2 aria-hidden />
          </Link>
        </Button>
        {canDock ? (
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={docked ? 'Unpin from the side' : 'Pin to the side'}
            aria-pressed={docked}
            onClick={togglePin}
          >
            {docked ? <PanelRightClose aria-hidden /> : <PanelRightOpen aria-hidden />}
          </Button>
        ) : null}
        <Button size="icon-sm" variant="ghost" aria-label="Close inbox" onClick={close}>
          <X aria-hidden />
        </Button>
      </header>

      {selected ? (
        <ConversationView key={selected.id} conversation={selected} className="min-h-0 flex-1" />
      ) : (
        <InboxList className="min-h-0 flex-1" />
      )}
    </div>
  );
}
