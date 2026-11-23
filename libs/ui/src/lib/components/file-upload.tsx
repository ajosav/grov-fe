import {type DragEvent, useId, useRef, useState} from 'react';

import {FileUp, X} from 'lucide-react';

import {cn} from '../utils/cn';

export interface FileUploadProps {
  /** Called with the accepted files; the caller uploads them (POST /v1/files via @grov/hooks). */
  onFiles: (files: File[]) => void;
  /** e.g. "image/png,image/jpeg,image/webp" or ".csv". */
  accept?: string;
  multiple?: boolean;
  /** Bytes; bigger files are refused with a message. */
  maxSize?: number;
  /** Files already picked (shown with a remove button). */
  files?: File[];
  onRemove?: (file: File) => void;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB`;

/** Drop zone + file picker. Presentation only: no upload logic in @grov/ui. */
export function FileUpload({
  onFiles,
  accept,
  multiple,
  maxSize,
  files = [],
  onRemove,
  hint,
  disabled,
  className,
}: FileUploadProps) {
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const take = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list).slice(0, multiple ? undefined : 1);
    const tooBig = maxSize ? picked.filter(f => f.size > maxSize) : [];
    setError(tooBig.length && maxSize ? `${tooBig[0]?.name} is over ${mb(maxSize)}.` : null);
    const ok = picked.filter(f => !maxSize || f.size <= maxSize);
    if (ok.length) onFiles(ok);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) take(event.dataTransfer.files);
  };

  return (
    <div className={cn('grid gap-3', className)}>
      <label
        htmlFor={id}
        onDragOver={event => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-line-strong/50 bg-surface px-6 py-8 text-center transition-colors',
          'hover:border-ink has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-flame/20',
          dragging && 'border-flame bg-flame-tint',
          disabled && 'pointer-events-none opacity-60'
        )}
      >
        <FileUp aria-hidden className="size-7 text-ink-muted" />
        <span className="text-label">
          Drop {multiple ? 'files' : 'a file'} here or <span className="underline">browse</span>
        </span>
        {hint ? <span className="text-body-sm text-ink-muted">{hint}</span> : null}
        <input
          ref={input}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={event => {
            take(event.target.files);
            event.target.value = '';
          }}
        />
      </label>
      {error ? (
        <p role="alert" className="text-body-sm text-danger">
          {error}
        </p>
      ) : null}
      {files.length ? (
        <ul className="grid gap-2">
          {files.map(file => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2"
            >
              <span className="min-w-0 flex-1 truncate text-body-sm font-semibold">
                {file.name}
              </span>
              <span className="text-body-sm text-ink-muted">{mb(file.size)}</span>
              {onRemove ? (
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => onRemove(file)}
                  className="flex size-9 items-center justify-center rounded-pill hover:bg-surface-sunken"
                >
                  <X aria-hidden className="size-4" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
