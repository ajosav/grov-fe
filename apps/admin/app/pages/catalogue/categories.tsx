import {useState} from 'react';

import {FolderTree, Pencil, Plus, Trash2} from 'lucide-react';
import {Link} from 'react-router';

import {useCategories, useDeleteCategory} from '@grov/hooks';
import {appConfig, type Category, PERMISSIONS} from '@grov/models';
import {Can, errorMessage, PageHeader} from '@grov/shared';
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '@grov/ui';

import {ActiveBadge, CategoryTintBadge} from '../../components/catalogue/category-badges';
import {CategoryDialog} from '../../components/catalogue/category-dialog';
import {categoryRows} from '../../lib/catalogue/categories';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {paths} from '../../paths';
import type {Route} from './+types/categories';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Categories · ${appConfig.brandName} admin`},
];

export default function Categories() {
  const categories = useCategories();
  const all = categories.data ?? [];
  const rows = categoryRows(all);
  const remove = useDeleteCategory();
  const [deleting, setDeleting] = useState<Category | null>(null);

  return (
    <>
      <PageHeader
        title="Categories"
        description="How products are grouped in Shop. Categories nest one level: a category, and its sub-categories."
        actions={
          <Can permission={PERMISSIONS.PRODUCTS.MANAGE}>
            <CategoryDialog
              categories={all}
              trigger={
                <Button>
                  <Plus aria-hidden /> Add category
                </Button>
              }
            />
          </Can>
        }
      />

      {categories.isPending ? (
        <Skeleton className="h-64" />
      ) : categories.isError ? (
        <Alert tone="danger" title="Couldn’t load categories">
          {errorMessage(categories.error)}
        </Alert>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderTree />}
            title="No categories yet"
            description="Add a category before adding products. Every product belongs to one."
            action={
              <Can permission={PERMISSIONS.PRODUCTS.MANAGE}>
                <CategoryDialog
                  categories={all}
                  trigger={
                    <Button>
                      <Plus aria-hidden /> Add category
                    </Button>
                  }
                />
              </Can>
            }
          />
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Active products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden text-right md:table-cell">Order</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({category, depth, childCount}) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className={depth === 1 ? 'pl-6' : undefined}>
                    <div className={depth === 0 ? 'font-semibold text-ink' : 'text-ink'}>
                      {category.name}
                    </div>
                    <div className="text-body-sm text-ink-muted">
                      {depth === 0 && childCount > 0
                        ? `${childCount} sub-${childCount === 1 ? 'category' : 'categories'}`
                        : category.slug}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <CategoryTintBadge tint={category.tintKey} />
                </TableCell>
                <TableCell className="text-right tabular">
                  {category.productCount > 0 ? (
                    <Link
                      to={`${paths.products}?categoryId=${category.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {category.productCount}
                    </Link>
                  ) : (
                    <span className="text-ink-muted">0</span>
                  )}
                </TableCell>
                <TableCell>
                  <ActiveBadge active={category.active} />
                </TableCell>
                <TableCell className="hidden text-right tabular text-ink-muted md:table-cell">
                  {category.sort}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Can permission={PERMISSIONS.PRODUCTS.MANAGE}>
                      {depth === 0 ? (
                        <CategoryDialog
                          categories={all}
                          parentId={category.id}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Add a sub-category to ${category.name}`}
                            >
                              <Plus aria-hidden /> Sub-category
                            </Button>
                          }
                        />
                      ) : null}
                      <CategoryDialog
                        category={category}
                        categories={all}
                        trigger={
                          <Button variant="ghost" size="sm" aria-label={`Edit ${category.name}`}>
                            <Pencil aria-hidden /> Edit
                          </Button>
                        }
                      />
                      {/* Only offered when nothing visible uses it; the server also checks inactive products and price markups. */}
                      {category.productCount === 0 && childCount === 0 ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${category.name}`}
                          onClick={() => {
                            remove.reset();
                            setDeleting(category);
                          }}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      ) : null}
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={open => {
          if (!open) setDeleting(null);
        }}
        title={deleting ? `Delete ${deleting.name}?` : ''}
        description="This can’t be undone. A category with any products, even inactive ones, can’t be deleted; make it inactive instead."
        confirmLabel="Delete category"
        tone="danger"
        loading={remove.isPending}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, {
            onSuccess: gone => {
              toast.success(`${gone.name} deleted`);
              setDeleting(null);
            },
          });
        }}
      >
        {remove.isError ? <Alert tone="danger">{errorMessage(remove.error)}</Alert> : null}
      </ConfirmDialog>
    </>
  );
}
