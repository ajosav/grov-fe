import {useMemo, useRef, useState} from 'react';

import {CircleDot, Crosshair, PenLine, Trash2} from 'lucide-react';

import {useCoverageCheck, useSetDeliveryZone} from '@grov/hooks';
import type {AdminStoreDetail, Pin} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {Alert, Badge, Button, Card, Field, Input, Segmented, Spinner, toast} from '@grov/ui';

import {
  circleZone,
  formatDistance,
  outlinesOf,
  polygonCount,
  type Position,
  toMultiPolygon,
  ZONE_RULES,
  zoneHasHoles,
} from '../../lib/stores/geo';
import {DEFAULT_RADIUS_KM} from '../../lib/stores/store-rules';
import {LazyStoreMap} from './lazy-store-map';
import type {DrawMode, StoreMapHandle} from './store-map';

type Tool = 'view' | 'circle' | 'draw' | 'check';

const minKm = ZONE_RULES.circleRadiusMinMetres / 1000;
const maxKm = ZONE_RULES.circleRadiusMaxMetres / 1000;

/**
 * The area a store delivers to. Start from a circle around the pin, then draw
 * or reshape areas; check any spot to see which store would serve it.
 */
export function ZoneEditor({store, canManage}: {store: AdminStoreDetail; canManage: boolean}) {
  const [tool, setTool] = useState<Tool>(store.hasDeliveryZone || !canManage ? 'view' : 'circle');
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [outlines, setOutlines] = useState<Position[][]>([]);
  const [drawMode, setDrawMode] = useState<DrawMode>('select');
  const [probe, setProbe] = useState<Pin | null>(null);
  const map = useRef<StoreMapHandle>(null);
  const setZone = useSetDeliveryZone();
  const coverage = useCoverageCheck();

  const radiusValid = Number.isFinite(radiusKm) && radiusKm >= minKm && radiusKm <= maxKm;
  const circlePreview = useMemo(
    () => (radiusValid ? circleZone(store.location, radiusKm * 1000) : null),
    [store.location, radiusKm, radiusValid]
  );

  const startDrawing = () => {
    const initial = outlinesOf(store.deliveryZone);
    setOutlines(initial);
    setDrawMode(initial.length ? 'select' : 'polygon');
    setTool('draw');
  };

  const choose = (next: Tool) => {
    setZone.reset();
    if (next !== 'check') {
      setProbe(null);
      coverage.reset();
    }
    if (next === 'draw') startDrawing();
    else setTool(next);
  };

  const done = (message: string) => {
    toast.success(message);
    setTool('view');
    map.current?.fit();
  };

  const saveCircle = () =>
    setZone.mutate(
      {id: store.id, body: {kind: 'CIRCLE', radiusMetres: Math.round(radiusKm * 1000)}},
      {onSuccess: () => done('Delivery zone saved')}
    );

  const saveShape = () =>
    setZone.mutate(
      {id: store.id, body: {kind: 'SHAPE', geometry: toMultiPolygon(outlines)}},
      {onSuccess: () => done('Delivery zone saved')}
    );

  const checkAt = (pin: Pin) => {
    setProbe(pin);
    coverage.mutate({pin});
  };

  const count = polygonCount(store.deliveryZone);
  const tooMany = outlines.length > ZONE_RULES.maxPolygons;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="h-[28rem] lg:order-1 lg:h-[calc(100dvh-15rem)] lg:min-h-[32rem]">
        <LazyStoreMap
          ref={map}
          label={`Delivery zone of ${store.name}`}
          pin={store.location}
          zone={tool === 'circle' ? circlePreview : store.deliveryZone}
          zonePreview={tool === 'circle'}
          drawing={
            tool === 'draw'
              ? {initial: outlinesOf(store.deliveryZone), mode: drawMode, onChange: setOutlines}
              : null
          }
          onProbe={tool === 'check' ? checkAt : undefined}
          probe={tool === 'check' ? probe : null}
          fallbackCenter={store.location}
          className="h-full"
        />
      </div>

      <Card className="grid content-start gap-4 self-start p-5 lg:order-2">
        {tool === 'view' ? (
          <>
            <div className="grid gap-1">
              <h2 className="text-title-sm">Delivery zone</h2>
              {store.hasDeliveryZone ? (
                <p className="text-body-sm text-ink-muted">
                  {count === 1 ? 'One area' : `${count} areas`}. Customers whose address falls
                  inside are served by this store when it’s the nearest active store covering them.
                </p>
              ) : (
                <p className="text-body-sm text-ink-muted">
                  No zone yet, so no address is served by this store.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              {canManage ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => choose('draw')}>
                    <PenLine aria-hidden />{' '}
                    {store.hasDeliveryZone ? 'Reshape the zone' : 'Draw the zone'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => choose('circle')}>
                    <CircleDot aria-hidden />
                    {store.hasDeliveryZone ? 'Replace with a circle' : 'Start from a circle'}
                  </Button>
                </>
              ) : null}
              <Button variant="outline" size="sm" onClick={() => choose('check')}>
                <Crosshair aria-hidden /> Check a spot
              </Button>
            </div>
          </>
        ) : null}

        {tool === 'circle' ? (
          <>
            <div className="grid gap-1">
              <h2 className="text-title-sm">Circle around the store</h2>
              <p className="text-body-sm text-ink-muted">
                {store.hasDeliveryZone
                  ? 'This replaces the current zone. You can reshape the circle afterwards.'
                  : 'A quick starting zone. You can reshape it afterwards.'}
              </p>
            </div>
            <Field
              label="Radius"
              hint={`${minKm}–${maxKm} km`}
              error={radiusValid ? undefined : `Use ${minKm} to ${maxKm} km`}
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  step={0.5}
                  min={minKm}
                  max={maxKm}
                  value={Number.isFinite(radiusKm) ? radiusKm : ''}
                  onChange={e => setRadiusKm(e.target.valueAsNumber)}
                  className="h-10 w-28 tabular"
                />
                <span className="text-body-sm text-ink-muted">km</span>
              </div>
            </Field>
            <SaveRow
              onSave={saveCircle}
              onCancel={store.hasDeliveryZone ? () => choose('view') : undefined}
              saving={setZone.isPending}
              disabled={!radiusValid}
              label="Save circle"
            />
          </>
        ) : null}

        {tool === 'draw' ? (
          <>
            <div className="grid gap-1">
              <h2 className="text-title-sm">Draw the zone</h2>
              <p className="text-body-sm text-ink-muted">
                {outlines.length === 1 ? 'One area' : `${outlines.length} areas`}. A zone can have
                several areas, up to {ZONE_RULES.maxPolygons}.
              </p>
            </div>
            <Segmented<DrawMode>
              label="Drawing tool"
              value={drawMode}
              onChange={setDrawMode}
              options={[
                {value: 'polygon', label: 'Add an area'},
                {value: 'select', label: 'Edit'},
              ]}
              className="[&_button]:h-8"
            />
            <p className="text-body-sm text-ink-muted">
              {drawMode === 'polygon'
                ? 'Click to place corners. Click the first corner, or press Enter, to close the area. Esc cancels it.'
                : 'Click an area to select it. Drag corners to move them, drag the small midpoints to add a corner, or drag the area to move it.'}
            </p>
            {drawMode === 'select' ? (
              <Button variant="outline" size="sm" onClick={() => map.current?.deleteSelected()}>
                <Trash2 aria-hidden /> Delete selected area
              </Button>
            ) : null}
            {zoneHasHoles(store.deliveryZone) ? (
              <Alert tone="warning">
                The saved zone has holes. Drawing keeps only the outer edges, so the holes go when
                you save.
              </Alert>
            ) : null}
            {tooMany ? (
              <Alert tone="danger">Use at most {ZONE_RULES.maxPolygons} areas.</Alert>
            ) : null}
            <SaveRow
              onSave={saveShape}
              onCancel={() => choose('view')}
              saving={setZone.isPending}
              disabled={outlines.length === 0 || tooMany}
              label="Save zone"
            />
          </>
        ) : null}

        {tool === 'check' ? (
          <>
            <div className="grid gap-1">
              <h2 className="text-title-sm">Check a spot</h2>
              <p className="text-body-sm text-ink-muted">
                Click anywhere on the map to see which store would serve an address there. Only
                active stores count.
              </p>
            </div>
            {store.status === 'INACTIVE' ? (
              <Alert tone="info">
                This store is inactive, so it won’t show up until you activate it.
              </Alert>
            ) : null}
            <CoverageResult
              storeId={store.id}
              probe={probe}
              pending={coverage.isPending}
              error={coverage.isError ? errorMessage(coverage.error) : undefined}
              result={coverage.data}
            />
            <Button variant="ghost" size="sm" onClick={() => choose('view')}>
              Done
            </Button>
          </>
        ) : null}

        {setZone.isError ? <Alert tone="danger">{errorMessage(setZone.error)}</Alert> : null}
      </Card>
    </div>
  );
}

function SaveRow({
  onSave,
  onCancel,
  saving,
  disabled,
  label,
}: {
  onSave: () => void;
  onCancel?: () => void;
  saving: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={onSave} loading={saving} disabled={disabled}>
        {label}
      </Button>
      {onCancel ? (
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      ) : null}
    </div>
  );
}

function CoverageResult({
  storeId,
  probe,
  pending,
  error,
  result,
}: {
  storeId: string;
  probe: Pin | null;
  pending: boolean;
  error?: string;
  result: ReturnType<typeof useCoverageCheck>['data'];
}) {
  if (!probe) return null;
  if (pending) {
    return (
      <p className="flex items-center gap-2 text-body-sm text-ink-muted" role="status">
        <Spinner className="size-4" /> Checking…
      </p>
    );
  }
  if (error) return <Alert tone="danger">{error}</Alert>;
  if (!result) return null;
  if (result.coveringStores.length === 0) {
    return (
      <div role="status" className="grid gap-1 rounded-md bg-surface-sunken p-3 text-body-sm">
        <span className="font-semibold">No store covers this spot</span>
        <span className="text-ink-muted">Customers here can join the waitlist.</span>
      </div>
    );
  }
  return (
    <ul role="status" className="grid gap-2">
      {result.coveringStores.map(({store, distanceMetres}) => {
        const serving = result.servingStore?.id === store.id;
        return (
          <li
            key={store.id}
            className="grid gap-0.5 rounded-md border border-line p-3 text-body-sm"
          >
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{store.name}</span>
              {store.id === storeId ? <Badge>This store</Badge> : null}
              {serving ? <Badge tone="leaf">Serves this spot</Badge> : null}
            </span>
            <span className="text-ink-muted">
              {formatDistance(distanceMetres)} away · {store.city.name}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
