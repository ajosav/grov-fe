import {useState} from 'react';

import {ArrowLeft, ArrowRight, ImageOff, Trash2} from 'lucide-react';

import {useFileUrls, useUploadImage} from '@grov/hooks';
import {PERMISSIONS} from '@grov/models';
import {errorMessage, usePermissions} from '@grov/shared';
import {Alert, Badge, Button, FileUpload} from '@grov/ui';

import {
  addImages,
  MAX_PRODUCT_IMAGES,
  moveImage,
  PRODUCT_IMAGE_DIRECTORY,
} from '../../lib/products';

/** grov-be's public-file policy: 5 MiB, and only these types (directory-policies.ts). */
const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';
const MAX_BYTES = 5 * 1024 * 1024;

export interface ProductImagesProps {
  /** Stored paths in order; the first is the cover shoppers see. */
  paths: string[];
  onChange: (paths: string[]) => void;
  /** Disable everything (a save is running, or the admin can only read). */
  disabled?: boolean;
}

/** Add, order and remove a product's photos. Files upload as soon as they're picked; saving the product keeps the paths. */
export function ProductImages({paths, onChange, disabled}: ProductImagesProps) {
  const {can} = usePermissions();
  const canUpload = can(PERMISSIONS.FILES.PUBLIC_WRITE);
  const upload = useUploadImage();
  const urls = useFileUrls(paths);
  // A fresh upload already carries its URL, so the photo shows before the lookup returns.
  const [fresh, setFresh] = useState<Record<string, string>>({});
  const [failures, setFailures] = useState<string[]>([]);
  const [uploading, setUploading] = useState(0);

  const room = MAX_PRODUCT_IMAGES - paths.length;

  const onFiles = async (files: File[]) => {
    const taken = files.slice(0, Math.max(room, 0));
    const problems: string[] = [];
    if (files.length > taken.length) {
      problems.push(
        `Only ${MAX_PRODUCT_IMAGES} photos fit. ${files.length - taken.length} not added.`
      );
    }
    setUploading(taken.length);
    const stored: string[] = [];
    const nextFresh: Record<string, string> = {};
    // One at a time: a rejected file doesn't hold up the others, and the order stays as picked.
    for (const file of taken) {
      try {
        const saved = await upload.mutateAsync({file, directory: PRODUCT_IMAGE_DIRECTORY});
        stored.push(saved.path);
        nextFresh[saved.path] = saved.url;
      } catch (error) {
        problems.push(`${file.name}: ${errorMessage(error)}`);
      }
      setUploading(count => count - 1);
    }
    setFresh(previous => ({...previous, ...nextFresh}));
    setFailures(problems);
    if (stored.length > 0) onChange(addImages(paths, stored));
  };

  return (
    <div className="grid gap-4">
      {paths.length > 0 ? (
        <ul
          aria-label="Product photos"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {paths.map((path, index) => {
            const url = fresh[path] ?? urls.data?.get(path);
            return (
              <li key={path} className="grid gap-2 rounded-md border border-line bg-surface p-2">
                <div className="relative aspect-square overflow-hidden rounded-sm bg-surface-sunken">
                  {url ? (
                    <img
                      src={url}
                      alt={`Product photo ${index + 1}`}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-ink-muted">
                      <ImageOff aria-hidden className="size-6" />
                    </div>
                  )}
                  {index === 0 ? (
                    <Badge tone="night" className="absolute left-2 top-2">
                      Cover
                    </Badge>
                  ) : null}
                </div>
                {!disabled ? (
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move photo ${index + 1} earlier`}
                        disabled={index === 0}
                        onClick={() => onChange(moveImage(paths, index, -1))}
                      >
                        <ArrowLeft aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move photo ${index + 1} later`}
                        disabled={index === paths.length - 1}
                        onClick={() => onChange(moveImage(paths, index, 1))}
                      >
                        <ArrowRight aria-hidden />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove photo ${index + 1}`}
                      onClick={() => onChange(paths.filter(existing => existing !== path))}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {canUpload && !disabled && room > 0 ? (
        <FileUpload
          multiple
          accept={ACCEPT}
          maxSize={MAX_BYTES}
          disabled={uploading > 0}
          onFiles={files => void onFiles(files)}
          hint={
            uploading > 0
              ? `Uploading ${uploading} ${uploading === 1 ? 'photo' : 'photos'}…`
              : `JPEG, PNG, WebP or AVIF, up to 5 MB each. ${room} more ${room === 1 ? 'photo fits' : 'photos fit'}.`
          }
        />
      ) : null}

      {!canUpload ? (
        <Alert tone="info" title="You can’t upload photos">
          Uploading needs the public files permission. Ask an admin to add it to your role.
        </Alert>
      ) : null}
      {canUpload && room <= 0 ? (
        <p className="text-body-sm text-ink-muted">
          A product holds up to {MAX_PRODUCT_IMAGES} photos. Remove one to add another.
        </p>
      ) : null}
      {failures.length > 0 ? (
        <Alert tone="danger" title="Some photos didn’t upload">
          <ul className="grid gap-1">
            {failures.map(message => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </Alert>
      ) : null}
      {paths.length === 0 && canUpload ? (
        <p className="text-body-sm text-ink-muted">
          No photos yet. The first one is the cover, so add the clearest shot first.
        </p>
      ) : null}
    </div>
  );
}
