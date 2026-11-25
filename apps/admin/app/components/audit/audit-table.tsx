import {ScrollText} from 'lucide-react';
import {Link} from 'react-router';

import type {AuditActionKind, AuditLogItem} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@grov/ui';

import {subjectKindLabel, subjectLink, subjectName} from '../../lib/audit/subject';
import {formatMomentSeconds} from '../../lib/format/dates';

const KIND_TONE: Record<AuditActionKind, 'sky' | 'neutral' | 'flame'> = {
  create: 'sky',
  update: 'neutral',
  delete: 'flame',
  other: 'neutral',
};

/** The record's name, opening it when it still exists and has a page. */
export function SubjectName({row}: {row: AuditLogItem}) {
  const name = subjectName(row);
  const to = subjectLink(row);
  if (!to) {
    return (
      <span className="max-w-64 truncate" title={name}>
        {name}
      </span>
    );
  }
  return (
    <Link
      to={to}
      title={`Open ${name}`}
      className="max-w-64 truncate rounded-sm underline-offset-4 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-focus"
    >
      {name}
    </Link>
  );
}

export interface AuditTableProps {
  rows: AuditLogItem[];
  loading: boolean;
  error: unknown;
  hasFilters: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onOpen: (id: string) => void;
}

export function AuditTable({
  rows,
  loading,
  error,
  hasFilters,
  hasMore,
  loadingMore,
  onLoadMore,
  onOpen,
}: AuditTableProps) {
  if (loading) return <Skeleton className="h-64 rounded-none" />;
  if (error) {
    return (
      <div className="p-4">
        <Alert tone="danger" title="Couldn’t load the audit log">
          {errorMessage(error)}
        </Alert>
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<ScrollText />}
        title={hasFilters ? 'Nothing matches' : 'No changes in this period'}
        description={
          hasFilters
            ? 'Try removing a filter or choosing a longer period.'
            : 'Changes made in the admin console show up here.'
        }
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead className="hidden lg:table-cell">Store</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(row => (
            <TableRow
              key={row.id}
              className="cursor-pointer"
              onClick={event => {
                // Links and buttons handle their own clicks.
                if ((event.target as HTMLElement).closest('a,button')) return;
                onOpen(row.id);
              }}
            >
              <TableCell className="whitespace-nowrap tabular">
                <button
                  type="button"
                  onClick={() => onOpen(row.id)}
                  aria-label={`Open details: ${row.label}, ${formatMomentSeconds(row.at)}`}
                  className="rounded-sm text-left underline-offset-4 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-focus"
                >
                  {formatMomentSeconds(row.at)}
                </button>
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  onClick={() => onOpen(row.id)}
                  aria-label={`Open details: ${row.label}, ${formatMomentSeconds(row.at)}`}
                  className="grid cursor-pointer gap-0.5 rounded-sm text-left outline-none focus-visible:outline-2 focus-visible:outline-focus"
                >
                  <Badge tone={KIND_TONE[row.kind]} className="w-fit capitalize">
                    {row.kind}
                  </Badge>
                  <span className="text-body-sm text-ink-muted underline-offset-4 hover:underline">
                    {row.label}
                  </span>
                </button>
              </TableCell>
              <TableCell>
                <div className="grid gap-0.5">
                  <SubjectName row={row} />
                  <span className="text-body-sm text-ink-muted">
                    {subjectKindLabel(row)}
                    {row.subject.kind === 'product' && row.storeName ? ` · ${row.storeName}` : ''}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="grid gap-0.5">
                  <span className="break-all">{row.actor?.email ?? 'System'}</span>
                  <span className="text-body-sm text-ink-muted">
                    {row.actor
                      ? row.actor.roles.length > 0
                        ? row.actor.roles.join(', ')
                        : (row.actor.name ?? 'Staff')
                      : 'Automatic'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden text-ink-muted lg:table-cell">
                {row.storeName ?? '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {hasMore ? (
        <div className="flex justify-center border-t border-line p-3">
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </>
  );
}
