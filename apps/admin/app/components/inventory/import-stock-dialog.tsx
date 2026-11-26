import {type ReactNode, useState} from 'react';

import {CheckCircle2, FileUp} from 'lucide-react';

import {useMe, useMyStores, useStartStockImport, useStockImportJob} from '@grov/hooks';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FileUpload,
  Label,
  Progress,
} from '@grov/ui';

import {newKey} from '../../lib/inventory/inventory-format';

const RUNNING = new Set(['PENDING', 'VALIDATING', 'PROCESSING']);

/**
 * Bulk-loads received stock from a CSV into DRAFT goods received notes at the active store.
 * Nothing touches stock until a draft is reviewed and posted. Rows sharing a `reference` land
 * on one note; bad rows are flagged by line and skipped.
 */
export function ImportStockDialog({trigger}: {trigger: ReactNode}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [key, setKey] = useState(newKey);
  const me = useMe();
  const stores = useMyStores();
  const userId = me.data?.id;
  const storeId = stores.data?.activeStoreId ?? null;
  const start = useStartStockImport();
  const job = useStockImportJob(start.data?.id);
  const status = job.data?.status ?? start.data?.status;
  const running = status !== undefined && RUNNING.has(status);

  const reset = () => {
    setFile(null);
    setDryRun(true);
    setKey(newKey());
    start.reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (!next && !running) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import received stock</DialogTitle>
          <DialogDescription>
            A CSV with <code>sku</code> and <code>quantity</code> (in the product’s base unit: g, ml
            or pcs). Optional: <code>purchaseCostKobo</code> (line total), <code>reference</code>,{' '}
            <code>receivedFrom</code>, <code>harvestedOn</code> and <code>expiresOn</code>{' '}
            (2026-12-31). Rows with the same reference become one draft note. Nothing is added to
            stock until you post each draft.
          </DialogDescription>
        </DialogHeader>

        {!start.data ? (
          <div className="grid gap-4">
            <FileUpload
              accept=".csv,text/csv"
              files={file ? [file] : []}
              onFiles={files => setFile(files[0] ?? null)}
              onRemove={() => setFile(null)}
              hint="CSV, up to 2,000 rows"
              maxSize={5 * 1024 * 1024}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="import-stock-dry-run"
                checked={dryRun}
                onCheckedChange={c => setDryRun(c === true)}
              />
              <Label htmlFor="import-stock-dry-run">Check only (don’t create any drafts)</Label>
            </div>
            {!storeId && !stores.isPending ? (
              <Alert tone="info">
                Switch to a store first: drafts are made for the active store.
              </Alert>
            ) : null}
            {start.isError ? (
              <Alert tone="danger" title="Couldn’t start the import">
                {errorMessage(start.error)}
              </Alert>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-3" aria-live="polite">
            {running ? (
              <>
                <p className="text-body">Checking rows and making drafts…</p>
                <Progress value={job.data?.progress ?? 0} max={100} label="Import progress" />
              </>
            ) : status === 'COMPLETED' ? (
              <Alert tone="success" title={job.data?.dryRun ? 'Check finished' : 'Drafts created'}>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 aria-hidden className="size-4" />
                  {job.data?.validRows ?? 0} of {job.data?.totalRows ?? 0} rows valid
                  {job.data?.dryRun ? '' : `, ${job.data?.appliedRows ?? 0} added to drafts`}
                  {job.data?.flaggedRows ? `, ${job.data.flaggedRows} flagged` : ''}.
                </span>
              </Alert>
            ) : (
              <Alert tone="danger" title="The import failed">
                {job.data?.failureCode ?? 'Try again with a valid CSV.'}
              </Alert>
            )}
            {job.data?.problems.length ? (
              <ul className="max-h-48 overflow-auto rounded-sm border border-line p-3 text-body-sm">
                {job.data.problems.map(problem => (
                  <li key={`${problem.line}-${problem.message}`}>
                    Line {problem.line}: {problem.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}

        <DialogFooter>
          {!start.data ? (
            <Button
              disabled={!file || !userId || !storeId}
              loading={start.isPending}
              onClick={() =>
                file &&
                userId &&
                storeId &&
                start.mutate({file, userId, storeId, dryRun, idempotencyKey: key})
              }
            >
              <FileUp aria-hidden /> {dryRun ? 'Check file' : 'Import as drafts'}
            </Button>
          ) : (
            <Button variant="outline" disabled={running} onClick={reset}>
              Import another file
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
