import {createContext, type ReactNode, useCallback, useContext, useMemo, useState} from 'react';

import {type AssistantReply, replyTo} from '../../lib/assistant/replies';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  link?: AssistantReply['link'];
}

interface AssistantState {
  open: boolean;
  messages: AssistantMessage[];
  show: () => void;
  close: () => void;
  toggle: () => void;
  /** Adds the question and the assistant's reply, and opens the panel. */
  ask: (question: string) => void;
  newConversation: () => void;
}

const AssistantContext = createContext<AssistantState | null>(null);

/**
 * The assistant panel's state for the whole console: open or closed and the conversation, which
 * lives in memory. Replies come from `replyTo` until `core/ai` exists (doc 38 M6); then they come
 * from the assistant module and this keeps only the panel state.
 */
export function AssistantProvider({children}: {children: ReactNode}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);

  const show = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen(value => !value), []);
  const newConversation = useCallback(() => setMessages([]), []);
  const ask = useCallback((question: string) => {
    const text = question.trim();
    if (!text) return;
    const reply = replyTo(text);
    setMessages(list => [
      ...list,
      {id: crypto.randomUUID(), role: 'user', text},
      {id: crypto.randomUUID(), role: 'assistant', text: reply.text, link: reply.link},
    ]);
    setOpen(true);
  }, []);

  const value = useMemo<AssistantState>(
    () => ({open, messages, show, close, toggle, ask, newConversation}),
    [open, messages, show, close, toggle, ask, newConversation]
  );
  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant(): AssistantState {
  const state = useContext(AssistantContext);
  if (!state) throw new Error('useAssistant needs <AssistantProvider> (the admin console layout).');
  return state;
}
