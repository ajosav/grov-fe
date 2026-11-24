import {type ReactNode} from 'react';

import {MapPin, Phone, ReceiptText, Wallet} from 'lucide-react';
import {Link} from 'react-router';

import {Avatar, cn, formatNaira, formatNigerianPhone} from '@grov/ui';

import {paths} from '../../paths';
import {CustomerHistory, CustomerNote} from './customer-history';
import {customerConversations, useSupport} from './support-context';
import type {Conversation} from './support-types';

/**
 * Who the customer is and what they have with us, next to the reply.
 * `compact` = one line plus the order (panel); full = focus mode's right pane.
 */
export function CustomerCard({
  conversation,
  compact,
  className,
}: {
  conversation: Conversation;
  compact?: boolean;
  className?: string;
}) {
  const {customer} = conversation;
  const order = customer.openOrder;
  const {conversations} = useSupport();
  const history = customerConversations(conversations, customer.id);
  const firstName = customer.name.split(' ')[0] ?? customer.name;

  return (
    <section aria-label="Customer" className={cn('grid gap-3', className)}>
      {compact ? null : (
        <div className="flex items-center gap-3">
          <Avatar name={customer.name} className="size-12" />
          <div className="min-w-0">
            <h3 className="truncate text-title-sm">{customer.name}</h3>
            <p className="truncate text-body-sm text-ink-muted">{customer.household}</p>
          </div>
        </div>
      )}

      <dl className={cn('grid gap-2 text-body-sm', compact ? 'grid-cols-2' : 'grid-cols-1')}>
        <Fact icon={<MapPin aria-hidden />} label="City and store">
          {customer.city} · {customer.storeName}
        </Fact>
        <Fact icon={<Phone aria-hidden />} label="Phone">
          <a className="underline-offset-2 hover:underline" href={`tel:${customer.phone}`}>
            {formatNigerianPhone(customer.phone)}
          </a>
        </Fact>
        {order ? (
          <Fact icon={<ReceiptText aria-hidden />} label="Open order" wide={compact}>
            <Link className="font-semibold underline-offset-2 hover:underline" to={paths.orders}>
              {order.number}
            </Link>{' '}
            · {formatNaira(order.totalKobo)} · next delivery {order.nextDelivery}
          </Fact>
        ) : null}
        <Fact icon={<Wallet aria-hidden />} label="Food balance">
          Food balance {formatNaira(customer.foodBalanceKobo)}
        </Fact>
      </dl>

      <CustomerNote key={customer.id} customerId={customer.id} firstName={firstName} />

      {compact ? (
        history.length > 1 ? (
          <details className="group">
            <summary className="cursor-pointer list-none text-body-sm text-ink-muted hover:text-ink [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Show</span>
              <span className="hidden group-open:inline">Hide</span> all {history.length}{' '}
              conversations with {firstName}
            </summary>
            <CustomerHistory conversation={conversation} className="mt-2" />
          </details>
        ) : null
      ) : (
        <>
          <p className="text-body-sm text-ink-muted">{customer.email}</p>
          <div className="grid gap-2 border-t border-line pt-4">
            <h4 className="text-label">Conversations ({history.length})</h4>
            <CustomerHistory conversation={conversation} className="-mx-2.5" />
          </div>
        </>
      )}
    </section>
  );
}

function Fact({
  icon,
  label,
  wide,
  children,
}: {
  icon: ReactNode;
  label: string;
  /** Span both columns of the compact card. */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex min-w-0 items-start gap-2', wide && 'col-span-2')}>
      <span className="mt-0.5 text-ink-muted [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <dt className="sr-only">{label}</dt>
        <dd className="truncate text-ink">{children}</dd>
      </div>
    </div>
  );
}
