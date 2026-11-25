import {useEffect, useState} from 'react';

import {ArrowLeft, Inbox, Minimize2, X} from 'lucide-react';
import {useLocation, useNavigate, useSearchParams} from 'react-router';

import {appConfig} from '@grov/models';
import {Button, EmptyState} from '@grov/ui';

import {ConversationView, CustomerCard, InboxList, useSupport} from '../components/support';
import {paths} from '../paths';
import type {Route} from './+types/support';

export const meta: Route.MetaFunction = () => [{title: `Support · ${appConfig.brandName} admin`}];

/**
 * Focus mode for support staff: list · thread · customer. Not in the sidebar;
 * reached from the inbox panel's expand button or ⌘K. `?c=` deep-links a conversation.
 * Minimise goes back to the page it came from with the panel open on the same
 * conversation; Close (or Esc) goes back with the panel shut.
 */
export default function SupportInbox() {
  const {conversations, selectedId, select, open, close} = useSupport();
  const navigate = useNavigate();
  const location = useLocation();
  // Kept from the first render: replacing `?c=` later drops the navigation state.
  const [from] = useState(
    () => (location.state as {from?: string} | null)?.from ?? paths.dashboard
  );
  const leave = (minimise: boolean) => {
    if (minimise) open(selectedId);
    navigate(from);
  };
  const [params, setParams] = useSearchParams();
  const fromUrl = params.get('c');

  // The URL owns the open conversation here, so a link or reload lands on it.
  useEffect(() => {
    close();
  }, [close]);
  useEffect(() => {
    if (fromUrl) select(fromUrl);
  }, [fromUrl, select]);
  useEffect(() => {
    if (selectedId && selectedId !== fromUrl) setParams({c: selectedId}, {replace: true});
  }, [selectedId, fromUrl, setParams]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest('input, textarea, [contenteditable="true"]');
      if (
        event.key !== 'Escape' ||
        typing ||
        document.querySelector('[role="dialog"], [role="menu"]')
      )
        return;
      navigate(from);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [from, navigate]);

  const selected = conversations.find(c => c.id === selectedId);

  return (
    <div className="grid h-[calc(100dvh-3.5rem)] grid-cols-1 md:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)_20rem]">
      <section
        aria-label="Inbox"
        className="flex min-h-0 flex-col border-r border-line bg-surface pt-4 max-md:[&:has(+section[data-open='true'])]:hidden"
      >
        <div className="flex items-center gap-1 px-4 pb-3">
          <h1 className="flex-1 text-title-md">Support</h1>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Minimise to the side panel"
            title="Minimise to the side panel"
            onClick={() => leave(true)}
          >
            <Minimize2 aria-hidden />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Close the inbox"
            title="Close (Esc)"
            aria-keyshortcuts="Escape"
            onClick={() => leave(false)}
          >
            <X aria-hidden />
          </Button>
        </div>
        <InboxList className="min-h-0 flex-1" />
      </section>

      <section
        aria-label="Conversation"
        data-open={Boolean(selected)}
        className="flex min-h-0 flex-col bg-canvas pt-4 max-md:data-[open=false]:hidden"
      >
        {selected ? (
          <Button
            variant="ghost"
            size="sm"
            className="mx-3 mb-2 self-start md:hidden"
            onClick={() => {
              select(null);
              setParams({}, {replace: true});
            }}
          >
            <ArrowLeft aria-hidden /> All conversations
          </Button>
        ) : null}
        {selected ? (
          <ConversationView
            key={selected.id}
            conversation={selected}
            customerClassName="xl:hidden"
            className="min-h-0 flex-1"
          />
        ) : (
          <EmptyState
            className="my-auto"
            icon={<Inbox aria-hidden />}
            title="Pick a conversation"
            description="Newest and most urgent are at the top of the list."
          />
        )}
      </section>

      <aside
        aria-label="Customer details"
        className="hidden min-h-0 overflow-y-auto border-l border-line bg-surface p-5 xl:block"
      >
        {selected ? <CustomerCard conversation={selected} /> : null}
      </aside>
    </div>
  );
}
