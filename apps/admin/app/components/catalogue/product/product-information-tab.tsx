import {useUpdateProduct} from '@grov/hooks';
import type {Product} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {Alert, Button, Segmented, toast} from '@grov/ui';

import {
  type DetailsEditor,
  DetailsTab,
  MoreTab,
  type SizesPrepEditor,
  SizesPrepTab,
} from '../product-tabs';

export type InformationSection = 'details' | 'sizes' | 'more';

export interface ProductInformationTabProps {
  product: Product;
  canManage: boolean;
  section: InformationSection;
  onSection: (section: InformationSection) => void;
  /** Owned by the page so unsaved edits survive switching tabs. */
  editor: DetailsEditor;
  sizesEditor: SizesPrepEditor;
}

/**
 * The existing product editor, split into its three sections. Validation, field errors and
 * the single Save for Details and More information are unchanged.
 */
export function ProductInformationTab({
  product,
  canManage,
  section,
  onSection,
  editor,
  sizesEditor,
}: ProductInformationTabProps) {
  const publish = useUpdateProduct();
  const liveSizes = product.sizes.filter(size => size.active).length;
  const livePrep = product.prepOptions.filter(option => option.active).length;

  return (
    <div className="grid gap-5">
      {product.draft ? (
        <Alert tone="info" title="This product is a draft" className="max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              {publish.isError
                ? errorMessage(publish.error)
                : 'Shoppers can’t see it yet. Give every size a price, then publish it. Save your edits first.'}
            </span>
            {canManage ? (
              <Button
                loading={publish.isPending}
                disabled={editor.dirty || sizesEditor.dirty}
                onClick={() =>
                  publish.mutate(
                    {id: product.id, body: {draft: false}},
                    {onSuccess: () => toast.success(`${product.displayName} is live`)}
                  )
                }
              >
                Publish
              </Button>
            ) : null}
          </div>
        </Alert>
      ) : null}
      <Segmented<InformationSection>
        label="Section"
        value={section}
        onChange={onSection}
        options={[
          {value: 'details', label: 'Details'},
          {value: 'sizes', label: `Sizes, prices & prep (${liveSizes + livePrep})`},
          {value: 'more', label: 'More information'},
        ]}
        size="sm"
        className="w-fit"
      />
      {section === 'details' ? (
        <DetailsTab product={product} canManage={canManage} editor={editor} />
      ) : null}
      {section === 'sizes' ? (
        <SizesPrepTab product={product} canManage={canManage} editor={sizesEditor} />
      ) : null}
      {section === 'more' ? (
        <MoreTab product={product} canManage={canManage} editor={editor} />
      ) : null}
    </div>
  );
}
