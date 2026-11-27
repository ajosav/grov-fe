import {useState} from 'react';

import {FileUp, PackagePlus, ReceiptText} from 'lucide-react';
import {Link, useSearchParams} from 'react-router';

import {
  useAddGrnCharge,
  useCancelGrn,
  useGrn,
  useGrns,
  useInventoryBatch,
  usePostGrn,
} from '@grov/hooks';
import {appConfig, type GrnStatus, PERMISSIONS} from '@grov/models';
import {Can, errorMessage, PageHeader, usePermissions} from '@grov/shared';
import {
  Alert,
  AmountInput,
  Badge,
  Button,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Field,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '@grov/ui';

import {BatchCorrectForm} from '../../components/inventory/batch-correct-form';
import {ImportStockDialog} from '../../components/inventory/import-stock-dialog';
import {ListSection} from '../../components/inventory/list-section';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {
  CHARGE_KINDS,
  costText,
  dayText,
  GRN_STATUS,
  momentText,
  newKey,
  qtyText,
  STOCK_COST_MAX_NAIRA,
} from '../../lib/inventory/inventory-format';
import {paths} from '../../paths';
import type {Route} from './+types/goods-received';

export const handle = {
  requires: {allOf: [PERMISSIONS.STOCK.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Goods received · ${appConfig.brandName} admin`},
];

type Scope = GrnStatus | 'all';
const SCOPES: Scope[] = ['all', 'DRAFT', 'POSTED', 'CANCELLED'];

export default function GoodsReceived() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('status');
  const scope: Scope = SCOPES.find(item => item === raw) ?? 'all';
  const [openId, setOpenId] = useState<string | null>(null);
  const list = useGrns({...(scope === 'all' ? {} : {status: scope}), limit: 50});
  const rows = list.data?.pages.flatMap(page => page.data) ?? [];

  return (
    <>
      <PageHeader
        title="Goods received"
        description="Every delivery booked in. A draft changes nothing until it is posted; posting creates the batches."
        actions={
          <Can permission={PERMISSIONS.STOCK.RECEIVE}>
            <div className="flex flex-wrap gap-2">
              <ImportStockDialog
                trigger={
                  <Button size="sm" variant="outline">
                    <FileUp aria-hidden /> Import CSV
                  </Button>
                }
              />
              <Button size="sm" asChild>
                <Link to={paths.stockReceipts}>
                  <PackagePlus aria-hidden /> Receive stock
                </Link>
              </Button>
            </div>
          </Can>
        }
      />
      <ListSection
        label="Goods received notes"
        query={list}
        count={rows.length}
        toolbar={
          <Segmented<Scope>
            size="sm"
            label="Status"
            value={scope}
            onChange={value =>
              setParams(
                previous => {
                  const next = new URLSearchParams(previous);
                  if (value === 'all') next.delete('status');
                  else next.set('status', value);
                  return next;
                },
                {replace: true}
              )
            }
            options={[
              {value: 'all', label: 'All'},
              {value: 'DRAFT', label: 'Drafts'},
              {value: 'POSTED', label: 'Posted'},
              {value: 'CANCELLED', label: 'Cancelled'},
            ]}
          />
        }
        empty={{
          icon: <ReceiptText />,
          title: 'No goods received notes',
          description: 'Notes appear here when a delivery is saved or posted.',
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Note</TableHead>
              <TableHead>From</TableHead>
              <TableHead className="hidden @3xl:table-cell">Reference</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(note => (
              <TableRow key={note.id} className="cursor-pointer" onClick={() => setOpenId(note.id)}>
                <TableCell>
                  <button
                    type="button"
                    className="font-semibold underline-offset-4 hover:underline focus-visible:underline"
                    onClick={event => {
                      event.stopPropagation();
                      setOpenId(note.id);
                    }}
                  >
                    {note.number}
                  </button>
                  <div className="text-body-sm text-ink-muted">
                    {momentText(note.postedAt ?? note.createdAt)}
                  </div>
                </TableCell>
                <TableCell>{note.supplierName ?? note.receivedFrom ?? '—'}</TableCell>
                <TableCell className="hidden text-body-sm @3xl:table-cell">
                  {note.reference ?? '—'}
                </TableCell>
                <TableCell className="text-right tabular">{note.lineCount}</TableCell>
                <TableCell>
                  <Badge tone={GRN_STATUS[note.status].tone}>{GRN_STATUS[note.status].label}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ListSection>

      <Dialog open={openId !== null} onOpenChange={open => (open ? undefined : setOpenId(null))}>
        <DialogContent layout="side" className="max-w-2xl content-start">
          {openId ? <GrnDetail id={openId} onClose={() => setOpenId(null)} /> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function GrnDetail({id, onClose}: {id: string; onClose: () => void}) {
  const note = useGrn(id);
  const {can} = usePermissions();
  const canReceive = can(PERMISSIONS.STOCK.RECEIVE);
  const post = usePostGrn();
  const cancel = useCancelGrn();
  const [postKey] = useState(newKey);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [correctId, setCorrectId] = useState<string | null>(null);

  if (note.isPending) return <Skeleton className="h-64" />;
  if (note.isError) return <Alert tone="danger">{errorMessage(note.error)}</Alert>;
  const data = note.data;
  const facts: [string, string][] = [
    ['From', data.supplierName ?? data.receivedFrom ?? '—'],
    ['Farm', data.farmName ?? '—'],
    ['Reference', data.reference ?? '—'],
    ['Created', momentText(data.createdAt)],
    ['Posted', momentText(data.postedAt)],
  ];
  const total = data.lines.reduce((sum, line) => sum + (line.purchaseCost?.kobo ?? 0), 0);
  const hasCosts = data.lines.some(line => line.purchaseCost !== null);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {data.number}
          <Badge tone={GRN_STATUS[data.status].tone}>{GRN_STATUS[data.status].label}</Badge>
        </DialogTitle>
        <DialogDescription>
          {data.status === 'DRAFT'
            ? 'Nothing is in stock yet. Post it to create the batches.'
            : data.status === 'POSTED'
              ? 'Stock is in. The batches below carry this note’s cost.'
              : 'Cancelled. It never changed stock.'}
        </DialogDescription>
      </DialogHeader>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {facts.map(([term, value]) => (
          <div key={term} className="grid gap-0.5">
            <dt className="text-body-sm text-ink-muted">{term}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Accepted</TableHead>
            <TableHead className="text-right">Rejected</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead>Batch</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.lines.map(line => (
            <TableRow key={line.id}>
              <TableCell>
                <div className="font-semibold">{line.productName}</div>
                <div className="text-body-sm text-ink-muted">
                  {line.hold ? 'On hold · ' : ''}
                  {line.expiresOn ? `Expires ${dayText(line.expiresOn)}` : line.sku}
                </div>
              </TableCell>
              <TableCell className="text-right tabular">
                {qtyText(line.acceptedQty, line.baseUnit)}
              </TableCell>
              <TableCell className="text-right tabular">
                {Number(line.rejectedQty) > 0 ? qtyText(line.rejectedQty, line.baseUnit) : '—'}
              </TableCell>
              <TableCell className="text-right tabular">{costText(line.purchaseCost)}</TableCell>
              <TableCell className="text-body-sm">
                <div>{line.batchNumber ?? '—'}</div>
                {canReceive && line.batchId ? (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    onClick={() => setCorrectId(line.batchId)}
                  >
                    Correct
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {hasCosts ? (
        <p className="text-body-sm text-ink-muted tabular">
          Goods total{' '}
          <span className="font-semibold text-ink">{costText({kobo: total, currency: 'NGN'})}</span>
        </p>
      ) : null}

      <h3 className="text-body font-semibold">Extra costs</h3>
      {data.charges.length === 0 ? (
        <p className="text-body-sm text-ink-muted">None recorded.</p>
      ) : (
        <ul className="grid gap-2">
          {data.charges.map(charge => (
            <li
              key={charge.id}
              className="flex items-center justify-between gap-3 rounded-md border border-line p-3 text-body-sm"
            >
              <span>
                {CHARGE_KINDS.find(kind => kind.code === charge.kind)?.label ?? charge.kind}
                {charge.note ? ` · ${charge.note}` : ''}
                <span className="text-ink-muted">
                  {' '}
                  · shared{' '}
                  {charge.allocateBy === 'WEIGHT'
                    ? 'by weight'
                    : charge.allocateBy === 'VALUE'
                      ? 'by value'
                      : 'equally'}
                  {charge.allocated ? ', added to batch cost' : ''}
                </span>
              </span>
              <span className="font-semibold tabular">{costText(charge.amount)}</span>
            </li>
          ))}
        </ul>
      )}
      {canReceive && data.status !== 'CANCELLED' ? <AddCharge id={data.id} /> : null}

      {post.isError ? <Alert tone="danger">{errorMessage(post.error)}</Alert> : null}
      {canReceive && data.status === 'DRAFT' ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmCancel(true)}>
            Cancel note
          </Button>
          <Button
            loading={post.isPending}
            onClick={() =>
              post.mutate(
                {id: data.id, idempotencyKey: postKey},
                {onSuccess: () => toast.success(`${data.number} posted. Stock is in.`)}
              )
            }
          >
            Post to stock
          </Button>
        </div>
      ) : null}
      <Dialog
        open={correctId !== null}
        onOpenChange={open => (open ? undefined : setCorrectId(null))}
      >
        <DialogContent layout="side" className="max-w-xl content-start">
          {correctId ? <CorrectLine batchId={correctId} onDone={() => setCorrectId(null)} /> : null}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={`Cancel ${data.number}?`}
        description="The draft is closed and never touches stock. You can’t reopen it."
        confirmLabel="Cancel note"
        tone="danger"
        loading={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(data.id, {
            onSuccess: () => {
              toast.success(`${data.number} cancelled`);
              setConfirmCancel(false);
              onClose();
            },
          })
        }
      >
        {cancel.isError ? <Alert tone="danger">{errorMessage(cancel.error)}</Alert> : null}
      </ConfirmDialog>
    </>
  );
}

/** Loads the batch a posted line made, then shows the correction form for it. */
function CorrectLine({batchId, onDone}: {batchId: string; onDone: () => void}) {
  const detail = useInventoryBatch(batchId);
  if (detail.isPending) return <Skeleton className="h-64" />;
  if (detail.isError) return <Alert tone="danger">{errorMessage(detail.error)}</Alert>;
  return <BatchCorrectForm batch={detail.data.batch} onDone={onDone} />;
}

function AddCharge({id}: {id: string}) {
  const add = useAddGrnCharge();
  const [key, setKey] = useState(newKey);
  const [kind, setKind] = useState<(typeof CHARGE_KINDS)[number]['code']>('TRANSPORT');
  const [allocateBy, setAllocateBy] = useState<'WEIGHT' | 'VALUE' | 'EQUAL'>('WEIGHT');
  const [amount, setAmount] = useState<number | null>(null);
  return (
    <form
      noValidate
      className="grid gap-3 rounded-lg border border-line p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
      onSubmit={event => {
        event.preventDefault();
        if (!amount) return;
        add.mutate(
          {id, idempotencyKey: key, body: {kind, amountKobo: amount, allocateBy}},
          {
            onSuccess: () => {
              toast.success('Cost added');
              setAmount(null);
              setKey(newKey());
            },
          }
        );
      }}
    >
      <Field label="Add a cost">
        <Select value={kind} onValueChange={value => setKind(value as typeof kind)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHARGE_KINDS.map(option => (
              <SelectItem key={option.code} value={option.code}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Amount">
        <AmountInput
          maxNaira={STOCK_COST_MAX_NAIRA}
          aria-label="Extra cost amount"
          key={key}
          valueKobo={amount}
          onChangeKobo={setAmount}
        />
      </Field>
      <Field label="Share">
        <Select
          value={allocateBy}
          onValueChange={value => setAllocateBy(value as typeof allocateBy)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WEIGHT">By weight</SelectItem>
            <SelectItem value="VALUE">By value</SelectItem>
            <SelectItem value="EQUAL">Equally</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Button type="submit" size="sm" loading={add.isPending} disabled={!amount}>
        Add
      </Button>
      {add.isError ? (
        <Alert tone="danger" className="sm:col-span-4">
          {errorMessage(add.error)}
        </Alert>
      ) : null}
    </form>
  );
}
