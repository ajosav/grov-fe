import {Alert, Button} from '@grov/ui';

export interface SaveBarProps {
  dirty: boolean;
  saving: boolean;
  /** Plain-language error from `errorMessage()`; shown above the buttons. */
  error?: string | null;
  onDiscard: () => void;
  /** Omit inside a `<form>`: the save button then submits it. */
  onSave?: () => void;
  saveLabel?: string;
  /** Block saving for a reason the admin can see (an incomplete choice). */
  saveDisabled?: boolean;
}

/** Save and discard for one tab. Nothing is sent until the admin saves; tabs save on their own. */
export function SaveBar({
  dirty,
  saving,
  error,
  onDiscard,
  onSave,
  saveLabel = 'Save changes',
  saveDisabled,
}: SaveBarProps) {
  return (
    <div className="mt-6 grid gap-3">
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type={onSave ? 'button' : 'submit'}
          loading={saving}
          disabled={!dirty || saveDisabled}
          onClick={onSave}
        >
          {saveLabel}
        </Button>
        <Button type="button" variant="ghost" disabled={!dirty || saving} onClick={onDiscard}>
          Discard changes
        </Button>
        {!dirty ? <span className="text-body-sm text-ink-muted">Nothing to save.</span> : null}
      </div>
    </div>
  );
}
