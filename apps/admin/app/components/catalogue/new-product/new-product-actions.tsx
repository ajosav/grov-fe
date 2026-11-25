import {X} from 'lucide-react';
import {Link} from 'react-router';

import {Button} from '@grov/ui';

import {paths} from '../../../paths';

interface NewProductActionsProps {
  canGoBack: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  busy: boolean;
  isLastStep: boolean;
}

/** Step navigation, save-as-draft, and the round cancel control below the form. */
export function NewProductActions({
  canGoBack,
  onBack,
  onSaveDraft,
  busy,
  isLastStep,
}: NewProductActionsProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {canGoBack ? (
          <Button type="button" variant="outline" disabled={busy} onClick={onBack}>
            Back
          </Button>
        ) : null}
        <Button type="submit" loading={busy}>
          {isLastStep ? 'Add product' : 'Next'}
        </Button>
      </div>
      {/* Like a sheet's close button: a round icon below the content, centred. In the flow, so it never covers the form. */}
      <div className="flex items-center justify-center gap-3 pb-4 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          className="rounded-pill bg-surface-raised shadow-raised"
          onClick={onSaveDraft}
        >
          Save as draft
        </Button>
        <Button
          asChild
          variant="outline"
          size="icon"
          aria-label="Cancel and go back to products"
          className="rounded-pill bg-surface-raised shadow-raised"
        >
          <Link to={paths.products}>
            <X aria-hidden />
          </Link>
        </Button>
      </div>
    </>
  );
}
