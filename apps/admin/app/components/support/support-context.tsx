import {createContext, type ReactNode, useCallback, useContext, useMemo, useState} from 'react';

import {useMe} from '@grov/hooks';

import {SAMPLE_CUSTOMER_NOTES, sampleConversations} from './sample-conversations';
import {
  type Conversation,
  type ConversationStatus,
  STATUS_LABEL,
  type SupportMessage,
} from './support-types';

export type SupportPanelMode = 'closed' | 'peek' | 'docked';
export type InboxView = 'mine' | 'unassigned' | 'all';

interface SupportState {
  mode: SupportPanelMode;
  selectedId: string | null;
  view: InboxView;
  conversations: Conversation[];
  /** Open and waiting on us: unassigned, or assigned to me. */
  waitingCount: number;
  me: string;
  open: (conversationId?: string | null) => void;
  close: () => void;
  togglePin: () => void;
  select: (conversationId: string | null) => void;
  setView: (view: InboxView) => void;
  send: (conversationId: string, body: string, kind: 'REPLY' | 'NOTE') => void;
  setStatus: (conversationId: string, status: ConversationStatus) => void;
  assignToMe: (conversationId: string) => void;
  /** Staff note pinned to a customer, across all their conversations. */
  customerNotes: Record<string, string>;
  setCustomerNote: (customerId: string, note: string) => void;
  /** Move `fromId`'s messages into `intoId`; `fromId` becomes read-only. */
  merge: (fromId: string, intoId: string) => void;
  /** Tie two separate conversations together. */
  link: (aId: string, bId: string) => void;
}

const SupportContext = createContext<SupportState | null>(null);

const event = (body: string): SupportMessage => ({
  id: crypto.randomUUID(),
  author: 'SYSTEM',
  authorName: 'System',
  kind: 'EVENT',
  body,
  at: new Date().toISOString(),
});

/**
 * Support inbox state for the whole console: the panel (closed, peek, docked),
 * the open conversation and, for now, sample conversations held in memory.
 * When grov-be's support module lands, the data moves to `@grov/hooks`
 * (`useConversations`, `useSendMessage`) and this keeps only the panel state.
 */
export function SupportProvider({children}: {children: ReactNode}) {
  const {data: me} = useMe();
  const myName = me?.firstName ?? 'You';
  const [mode, setMode] = useState<SupportPanelMode>('closed');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<InboxView>('all');
  const [conversations, setConversations] = useState(() => sampleConversations());
  const [customerNotes, setCustomerNotes] = useState(SAMPLE_CUSTOMER_NOTES);

  const patch = useCallback(
    (id: string, change: (c: Conversation) => Conversation) =>
      setConversations(list => list.map(c => (c.id === id ? change(c) : c))),
    []
  );

  const open = useCallback(
    (id?: string | null) => {
      if (id !== undefined) setSelectedId(id);
      setMode(m => (m === 'closed' ? 'peek' : m));
      if (id) patch(id, c => ({...c, unread: false}));
    },
    [patch]
  );
  const close = useCallback(() => setMode('closed'), []);
  const togglePin = useCallback(() => setMode(m => (m === 'docked' ? 'peek' : 'docked')), []);
  const select = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (id) patch(id, c => ({...c, unread: false}));
    },
    [patch]
  );
  const send = useCallback(
    (id: string, body: string, kind: 'REPLY' | 'NOTE') =>
      patch(id, c => ({
        ...c,
        assignee: c.assignee ?? myName,
        messages: [
          ...c.messages,
          {
            id: crypto.randomUUID(),
            author: 'STAFF',
            authorName: myName,
            kind,
            body,
            at: new Date().toISOString(),
          },
        ],
      })),
    [patch, myName]
  );
  const setStatus = useCallback(
    (id: string, status: ConversationStatus) =>
      patch(id, c => ({
        ...c,
        status,
        messages: [...c.messages, event(`${myName} set status to ${STATUS_LABEL[status]}`)],
      })),
    [patch, myName]
  );
  const assignToMe = useCallback(
    (id: string) =>
      patch(id, c => ({
        ...c,
        assignee: myName,
        messages: [...c.messages, event(`${myName} took this conversation`)],
      })),
    [patch, myName]
  );

  const setCustomerNote = useCallback(
    (customerId: string, note: string) =>
      setCustomerNotes(notes => {
        const next = {...notes};
        if (note.trim()) next[customerId] = note.trim();
        else delete next[customerId];
        return next;
      }),
    []
  );
  const merge = useCallback(
    (fromId: string, intoId: string) => {
      setConversations(list => {
        const from = list.find(c => c.id === fromId);
        const into = list.find(c => c.id === intoId);
        if (!from || !into) return list;
        const moved = from.messages.filter(m => m.kind !== 'EVENT');
        return list.map((c): Conversation => {
          if (c.id === intoId) {
            return {
              ...c,
              status: c.status === 'RESOLVED' ? 'OPEN' : c.status,
              unread: c.unread || from.unread,
              priority: from.priority === 'HIGH' ? 'HIGH' : c.priority,
              dueAt: Date.parse(from.dueAt) < Date.parse(c.dueAt) ? from.dueAt : c.dueAt,
              messages: [
                ...[...c.messages, ...moved].sort((a, b) => Date.parse(a.at) - Date.parse(b.at)),
                event(`${myName} merged ${from.number} into this conversation`),
              ],
            };
          }
          if (c.id === fromId) {
            return {
              ...c,
              status: 'RESOLVED',
              unread: false,
              mergedIntoId: intoId,
              messages: [...c.messages, event(`${myName} merged this into ${into.number}`)],
            };
          }
          return c;
        });
      });
      setSelectedId(intoId);
    },
    [myName]
  );
  const link = useCallback(
    (aId: string, bId: string) =>
      setConversations(list => {
        const a = list.find(c => c.id === aId);
        const b = list.find(c => c.id === bId);
        if (!a || !b) return list;
        const tie = (c: Conversation, other: Conversation): Conversation => ({
          ...c,
          relatedIds: [...new Set([...(c.relatedIds ?? []), other.id])],
          messages: [...c.messages, event(`${myName} linked ${other.number}`)],
        });
        return list.map(c => (c.id === aId ? tie(c, b) : c.id === bId ? tie(c, a) : c));
      }),
    [myName]
  );

  const value = useMemo<SupportState>(
    () => ({
      mode,
      selectedId,
      view,
      conversations,
      me: myName,
      waitingCount: conversations.filter(
        c =>
          !c.mergedIntoId && c.status === 'OPEN' && (c.assignee === null || c.assignee === myName)
      ).length,
      open,
      close,
      togglePin,
      select,
      setView,
      send,
      setStatus,
      assignToMe,
      customerNotes,
      setCustomerNote,
      merge,
      link,
    }),
    [
      mode,
      selectedId,
      view,
      conversations,
      myName,
      open,
      close,
      togglePin,
      select,
      send,
      setStatus,
      assignToMe,
      customerNotes,
      setCustomerNote,
      merge,
      link,
    ]
  );

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

export function useSupport(): SupportState {
  const state = useContext(SupportContext);
  if (!state) throw new Error('useSupport needs <SupportProvider> (the admin console layout).');
  return state;
}

export function filterInbox(
  list: Conversation[],
  view: InboxView,
  me: string,
  now = Date.now()
): Conversation[] {
  // Resolved more than a week ago: kept in the customer's history and search, not the inbox.
  const cutoff = now - 7 * 24 * 60 * 60_000;
  const shown = list.filter(
    c =>
      !c.mergedIntoId &&
      (c.status !== 'RESOLVED' || Date.parse(lastActivity(c)) >= cutoff) &&
      (view === 'mine' ? c.assignee === me : view === 'unassigned' ? c.assignee === null : true)
  );
  // Waiting on us first, soonest due first; resolved last.
  const rank = (c: Conversation) => (c.status === 'OPEN' ? 0 : c.status === 'PENDING' ? 1 : 2);
  return [...shown].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (a.status === 'RESOLVED'
        ? Date.parse(lastActivity(b)) - Date.parse(lastActivity(a))
        : Date.parse(a.dueAt) - Date.parse(b.dueAt))
  );
}

/** Everything this customer has raised: open first, then newest first; merged ones last. */
export function customerConversations(list: Conversation[], customerId: string): Conversation[] {
  const rank = (c: Conversation) =>
    c.mergedIntoId ? 3 : c.status === 'OPEN' ? 0 : c.status === 'PENDING' ? 1 : 2;
  return list
    .filter(c => c.customer.id === customerId)
    .sort((a, b) => rank(a) - rank(b) || Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** The customer's other conversations still waiting on someone. */
export function otherOpen(list: Conversation[], c: Conversation): Conversation[] {
  return list.filter(
    o =>
      o.customer.id === c.customer.id && o.id !== c.id && !o.mergedIntoId && o.status !== 'RESOLVED'
  );
}

function lastActivity(c: Conversation): string {
  return c.messages.at(-1)?.at ?? c.createdAt;
}
