import {type ReactNode, useState} from 'react';

import {CheckCircle2, FileUp} from 'lucide-react';

import {useImportJob, useStartPriceImport} from '@grov/hooks';
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

export interface ImportPricesDialogProps {
  trigger: ReactNode;
  userId: string;
}

const RUNNING = new Set(['PENDING', 'VALIDATING', 'PROCESSING']);

/**
 * Bulk base prices from a CSV (sku, size, priceKobo) through the imports pipeline: the file
 * is checked row by row in the background, bad rows are flagged and skipped, and "Check
 * only" validates without changing a price.
 */
export function ImportPricesDialog({trigger, userId}: ImportPricesDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [key, setKey] = useState(() => crypto.randomUUID());
  const start = useStartPriceImport();
  const job = useImportJob(start.data?.id);
  const status = job.data?.status ?? start.data?.status;
  const running = status !== undefined && RUNNING.has(status);

  const reset = () => {
    setFile(null);
    setDryRun(true);
    setKey(crypto.randomUUID());
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
          <DialogTitle>Import base prices</DialogTitle>
          <DialogDescription>
            A CSV with the columns <code>sku</code>, <code>size</code> and <code>priceKobo</code>.
            Prices go live at every store when the import is applied, and the old prices stay in
            each product’s history.
          </DialogDescription>
        </DialogHeader>

        {!start.data ? (
          <div className="grid gap-4">
            <FileUpload
              accept=".csv,text/csv"
              files={file ? [file] : []}
              onFiles={files => setFile(files[0] ?? null)}
              onRemove={() => setFile(null)}
              hint="CSV, up to 5 MB"
              maxSize={5 * 1024 * 1024}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="import-dry-run"
                checked={dryRun}
                onCheckedChange={c => setDryRun(c === true)}
              />
              <Label htmlFor="import-dry-run">Check only (don’t change any prices)</Label>
            </div>
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
                <p className="text-body">Checking and applying rows…</p>
                <Progress value={job.data?.progress ?? 0} max={100} label="Import progress" />
              </>
            ) : status === 'COMPLETED' ? (
              <Alert tone="success" title={job.data?.dryRun ? 'Check finished' : 'Import finished'}>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 aria-hidden className="size-4" />
                  {job.data?.validRows ?? 0} of {job.data?.totalRows ?? 0} rows valid
                  {job.data?.dryRun ? '' : `, ${job.data?.appliedRows ?? 0} applied`}
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
              disabled={!file}
              loading={start.isPending}
              onClick={() => file && start.mutate({file, userId, dryRun, idempotencyKey: key})}
            >
              <FileUp aria-hidden /> {dryRun ? 'Check file' : 'Import prices'}
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
