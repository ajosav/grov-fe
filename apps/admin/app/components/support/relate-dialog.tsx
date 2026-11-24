import {useState} from 'react';

import {GitMerge, Link2} from 'lucide-react';

import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tag,
} from '@grov/ui';

import {customerConversations, useSupport} from './support-context';
import {type Conversation, STATUS_LABEL} from './support-types';

/**
 * Merge this conversation into another of the customer's, or link the two.
 * Merge = one issue raised twice: messages move, this one closes.
 * Link = separate issues that belong together (a missing item and its refund).
 */
export function RelateDialog({
  conversation: c,
  open,
  onOpenChange,
}: {
  conversation: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {conversations, merge, link} = useSupport();
  const candidates = customerConversations(conversations, c.customer.id).filter(
    o => o.id !== c.id && !o.mergedIntoId
  );
  const [targetId, setTargetId] = useState<string | null>(null);
  const target = candidates.find(o => o.id === targetId);
  const linked = Boolean(target && c.relatedIds?.includes(target.id));
  const firstName = c.customer.name.split(' ')[0];

  const done = () => {
    setTargetId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Merge or link {c.number}</DialogTitle>
          <DialogDescription>
            Merge when {firstName} raised the same issue twice: the messages move across and{' '}
            {c.number} closes. Link when they’re separate issues that belong together.
          </DialogDescription>
        </DialogHeader>

        {candidates.length === 0 ? (
          <p className="text-body text-ink-muted">{firstName} has no other conversations.</p>
        ) : (
          <div role="radiogroup" aria-label="Other conversations" className="grid gap-1.5">
            {candidates.map(o => {
              const checked = o.id === targetId;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => setTargetId(o.id)}
                  className={cn(
                    'grid gap-1 rounded-md border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                    checked ? 'border-ink bg-surface-sunken' : 'border-line hover:bg-surface-sunken'
                  )}
                >
                  <span className="flex items-center gap-2 text-body-sm text-ink-muted">
                    <span className="font-semibold text-ink">{o.number}</span>
                    {o.orderNumber ? <span>Order {o.orderNumber}</span> : null}
                    {o.orderNumber && o.orderNumber === c.orderNumber ? (
                      <Tag tone="info">Same order</Tag>
                    ) : null}
                    {c.relatedIds?.includes(o.id) ? <Tag>Linked</Tag> : null}
                  </span>
                  <span className="text-body text-ink">{o.subject}</span>
                  <span className="text-body-sm text-ink-muted">
                    {STATUS_LABEL[o.status]} · {o.assignee ?? 'Unassigned'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            disabled={!target || linked}
            onClick={() => {
              if (target) link(c.id, target.id);
              done();
            }}
          >
            <Link2 aria-hidden /> {linked ? 'Already linked' : 'Link'}
          </Button>
          <Button
            size="sm"
            disabled={!target}
            onClick={() => {
              if (target) merge(c.id, target.id);
              done();
            }}
          >
            <GitMerge aria-hidden /> {target ? `Merge into ${target.number}` : 'Merge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
