import type {ReactNode} from 'react';

import {useAuditLog} from '@grov/hooks';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Badge,
  CopyableText,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@grov/ui';

import {subjectKindLabel} from '../../lib/audit/subject';
import {formatMomentSeconds} from '../../lib/format/dates';
import {SubjectName} from './audit-table';

function Row({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[8rem_1fr] sm:gap-3">
      <dt className="text-body-sm text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

export interface AuditDetailDialogProps {
  id: string | null;
  onClose: () => void;
}

/** One entry: who, when, on what, what changed since the previous entry for the record, and what was saved. */
export function AuditDetailDialog({id, onClose}: AuditDetailDialogProps) {
  const entry = useAuditLog(id ?? undefined);
  const data = entry.data;

  return (
    <Dialog open={id !== null} onOpenChange={open => !open && onClose()}>
      <DialogContent layout="side" className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{data?.label ?? 'Audit entry'}</DialogTitle>
          <DialogDescription>
            {data ? formatMomentSeconds(data.at) : 'Loading the details'}
          </DialogDescription>
        </DialogHeader>

        {entry.isPending ? <Skeleton className="h-48" /> : null}
        {entry.isError ? (
          <Alert tone="danger" title="Couldn’t load this entry">
            {errorMessage(entry.error)}
          </Alert>
        ) : null}

        {data ? (
          <div className="grid gap-5">
            <dl className="grid gap-3 text-body-sm">
              <Row label="Action">
                <Badge className="capitalize">{data.kind}</Badge>{' '}
                <span className="text-ink-muted">{data.action}</span>
              </Row>
              <Row label="Actor">
                {data.actor ? (
                  <>
                    {data.actor.name ? `${data.actor.name} · ` : ''}
                    {data.actor.email}
                    {data.actor.roles.length > 0 ? (
                      <span className="block text-ink-muted">{data.actor.roles.join(', ')}</span>
                    ) : null}
                  </>
                ) : (
                  'System (automatic)'
                )}
              </Row>
              <Row label="Resource">
                <span className="inline-flex flex-wrap items-center gap-x-1.5">
                  <SubjectName row={data} />
                  <span className="text-ink-muted">
                    · {subjectKindLabel(data)} · {data.moduleLabel}
                  </span>
                </span>
              </Row>
              {data.entityId ? (
                <Row label="Record ID">
                  <CopyableText value={data.entityId} label="record ID" />
                </Row>
              ) : null}
              <Row label="Store">{data.storeName ?? '—'}</Row>
              {data.ip ? <Row label="IP address">{data.ip}</Row> : null}
              {data.requestId ? (
                <Row label="Request ID">
                  <CopyableText value={data.requestId} label="request ID" />
                </Row>
              ) : null}
            </dl>

            <section aria-labelledby="audit-changes">
              <h3 id="audit-changes" className="mb-2 text-body font-semibold">
                What changed
              </h3>
              {data.changes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Before</TableHead>
                      <TableHead>After</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.changes.map(change => (
                      <TableRow key={change.field}>
                        <TableCell className="font-semibold">{change.field}</TableCell>
                        <TableCell className="break-words text-ink-muted">
                          {change.before ?? '—'}
                        </TableCell>
                        <TableCell className="break-words">{change.after ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-body-sm text-ink-muted">
                  {data.previousId
                    ? 'Nothing differs from the previous entry for this record.'
                    : 'This is the first entry for this record, so there is nothing to compare.'}
                </p>
              )}
            </section>

            {data.snapshot ? (
              <section aria-labelledby="audit-saved">
                <h3 id="audit-saved" className="mb-2 text-body font-semibold">
                  What was saved
                </h3>
                <pre className="max-h-80 overflow-auto rounded-md bg-surface-sunken p-3 text-body-sm">
                  {JSON.stringify(data.snapshot, null, 2)}
                </pre>
              </section>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
