import {forwardRef, useRef, useState} from 'react';

import {Bold, Italic, Link2, List, ListOrdered} from 'lucide-react';

import {Button, cn, Markdown, Segmented, Textarea} from '@grov/ui';

import {type Edit, insertLink, toggleList, wrapSelection} from '../../lib/catalogue/markdown';

export interface MarkdownFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Shows a live count against this limit. */
  maxLength?: number;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

type Mode = 'write' | 'preview';

/**
 * A text box for Markdown with a small toolbar and a preview. Only what web and mobile
 * both draw the same way is offered: bold, italic, lists and links. Use inside `<Field>`.
 */
export const MarkdownField = forwardRef<HTMLTextAreaElement, MarkdownFieldProps>(
  function MarkdownField({value, onChange, disabled, maxLength, ...aria}, _ref) {
    const box = useRef<HTMLTextAreaElement>(null);
    const [mode, setMode] = useState<Mode>('write');
    // The server trims before it counts, so the count does too.
    const count = value.trim().length;

    const apply = (edit: (text: string, start: number, end: number) => Edit) => {
      const element = box.current;
      if (!element) return;
      const result = edit(value, element.selectionStart, element.selectionEnd);
      onChange(result.text);
      // The textarea re-renders with the new text; put the selection back after it does.
      requestAnimationFrame(() => {
        element.focus();
        element.setSelectionRange(result.start, result.end);
      });
    };

    const tools = [
      {
        label: 'Bold',
        icon: Bold,
        run: () => apply((t, s, e) => wrapSelection(t, s, e, '**', 'bold text')),
      },
      {
        label: 'Italic',
        icon: Italic,
        run: () => apply((t, s, e) => wrapSelection(t, s, e, '*', 'italic text')),
      },
      {
        label: 'Bulleted list',
        icon: List,
        run: () => apply((t, s, e) => toggleList(t, s, e, false)),
      },
      {
        label: 'Numbered list',
        icon: ListOrdered,
        run: () => apply((t, s, e) => toggleList(t, s, e, true)),
      },
      {label: 'Link', icon: Link2, run: () => apply(insertLink)},
    ];

    return (
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div role="toolbar" aria-label="Formatting" className="flex gap-1">
            {tools.map(tool => (
              <Button
                key={tool.label}
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={tool.label}
                title={tool.label}
                disabled={disabled || mode === 'preview'}
                onClick={tool.run}
              >
                <tool.icon aria-hidden />
              </Button>
            ))}
          </div>
          <Segmented<Mode>
            label="Description view"
            value={mode}
            onChange={setMode}
            options={[
              {value: 'write', label: 'Write'},
              {value: 'preview', label: 'Preview'},
            ]}
            className="[&_button]:h-8"
          />
        </div>
        {mode === 'write' ? (
          <Textarea
            ref={box}
            value={value}
            disabled={disabled}
            onChange={event => onChange(event.target.value)}
            {...aria}
          />
        ) : (
          <div className="min-h-28 rounded-md border border-line bg-surface-sunken px-4 py-3">
            {value.trim() ? (
              <Markdown>{value}</Markdown>
            ) : (
              <p className="text-body-sm text-ink-muted">Nothing to preview yet.</p>
            )}
          </div>
        )}
        {maxLength ? (
          <p
            aria-live="polite"
            className={cn(
              'text-right text-body-sm tabular-nums',
              count > maxLength ? 'font-semibold text-danger' : 'text-ink-muted'
            )}
          >
            {count.toLocaleString('en-NG')} / {maxLength.toLocaleString('en-NG')} characters
          </p>
        ) : null}
      </div>
    );
  }
);
