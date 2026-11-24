import {type Ref, useEffect, useImperativeHandle, useRef} from 'react';

import {
  type GeoJSONSource,
  type GeoJSONSourceSpecification,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
} from 'maplibre-gl';
// MapLibre finds its worker relative to its own file, which Vite's bundling moves.
// Importing it as an asset gives a URL that works in dev and in builds.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  type GeoJSONStoreFeatures,
  type HexColor,
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
} from 'terra-draw';
import {TerraDrawMapLibreGLAdapter} from 'terra-draw-maplibre-gl-adapter';

import {appConfig, type GeoJsonMultiPolygon, type Pin} from '@grov/models';
import {cn, useTheme} from '@grov/ui';

import {boundsOf, type Position, roundPin} from '../../lib/stores/geo';

export type DrawMode = 'polygon' | 'select';

export interface DrawingOptions {
  /** Outlines to start from. Read once when drawing starts; remount (key) to reset. */
  initial: Position[][];
  mode: DrawMode;
  /** Every finished outline, after each change. */
  onChange: (outlines: Position[][]) => void;
}

export interface StoreMapHandle {
  /** Remove the selected outline while drawing. */
  deleteSelected: () => void;
  /** Frame the zone and pins. */
  fit: () => void;
}

export interface StoreMapProps {
  /** Accessible name for the map region. */
  label: string;
  /** The store's location. */
  pin: Pin | null;
  /** Lets the admin click the map or drag the marker to move the store. */
  onPinChange?: (pin: Pin) => void;
  /** The zone to show (saved, or a preview). */
  zone?: GeoJsonMultiPolygon | null;
  /** Dashed outline for a zone that isn't saved yet. */
  zonePreview?: boolean;
  /** Edit outlines with the drawing tools. The shown `zone` is hidden meanwhile. */
  drawing?: DrawingOptions | null;
  /** Click to drop a test pin (coverage check). Takes priority over `onPinChange`. */
  onProbe?: (pin: Pin) => void;
  probe?: Pin | null;
  /** Where to look when there's no pin or zone yet. */
  fallbackCenter: Pin;
  className?: string;
  ref?: Ref<StoreMapHandle>;
}

setWorkerUrl(workerUrl);

const ZONE_SOURCE = 'store-zone';
const EMPTY: GeoJSONSourceSpecification['data'] = {type: 'FeatureCollection', features: []};

/** Brand tokens are hex in tokens.css; the map needs concrete colours, not CSS variables. */
function token(element: Element, name: string, fallback: HexColor): HexColor {
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  return (/^#[0-9a-f]{3,8}$/i.test(value) ? value : fallback) as HexColor;
}

/**
 * MapLibre map for a store: its pin, its delivery zone, drawing tools
 * (Terra Draw) and a coverage probe. Loaded lazily; see `LazyStoreMap`.
 */
export function StoreMap(props: StoreMapProps) {
  const {resolved} = useTheme();
  // A new style drops custom layers and the drawing tools; remounting is simpler and rare.
  return <MapCanvas key={resolved} dark={resolved === 'dark'} {...props} />;
}

function MapCanvas({
  label,
  pin,
  onPinChange,
  zone,
  zonePreview,
  drawing,
  onProbe,
  probe,
  fallbackCenter,
  className,
  ref,
  dark,
}: StoreMapProps & {dark: boolean}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const loaded = useRef(false);
  /** Work waiting for the style to load. */
  const pending = useRef<(() => void)[]>([]);
  const whenLoaded = (task: () => void) => {
    if (loaded.current) task();
    else pending.current.push(task);
  };
  const pinMarker = useRef<Marker | null>(null);
  const probeMarker = useRef<Marker | null>(null);
  const draw = useRef<TerraDraw | null>(null);

  // Latest props for map event handlers registered once.
  const latest = useRef({pin, zone, onPinChange, onProbe, drawing});
  latest.current = {pin, zone, onPinChange, onProbe, drawing};

  const fit = () => {
    const m = map.current;
    if (!m) return;
    const {zone: z, pin: p} = latest.current;
    const bounds = boundsOf(z, [p]);
    if (!bounds) {
      m.jumpTo({center: [fallbackCenter.lng, fallbackCenter.lat], zoom: 11});
      return;
    }
    const [[w, s], [e, n]] = bounds;
    if (w === e && s === n) m.jumpTo({center: [w, s], zoom: 13});
    else m.fitBounds(bounds, {padding: 48, maxZoom: 15, duration: 0});
  };

  useImperativeHandle(ref, () => ({
    fit,
    deleteSelected: () => {
      const d = draw.current;
      if (!d) return;
      const selected = d
        .getSnapshot()
        .filter(f => f.properties.selected)
        .map(f => f.id)
        .filter((id): id is string | number => id !== undefined);
      if (selected.length) d.removeFeatures(selected);
    },
  }));

  // Create the map once (per theme).
  useEffect(() => {
    if (!container.current) return;
    const m = new MapLibreMap({
      container: container.current,
      style: dark ? appConfig.mapStyleDarkUrl : appConfig.mapStyleUrl,
      center: [fallbackCenter.lng, fallbackCenter.lat],
      zoom: 11,
      attributionControl: {compact: true},
      dragRotate: false,
      pitchWithRotate: false,
    });
    m.touchZoomRotate.disableRotation();
    m.addControl(new NavigationControl({showCompass: false}), 'top-right');
    map.current = m;

    const flame = token(container.current, '--flame', '#FF550C');
    m.on('load', () => {
      m.addSource(ZONE_SOURCE, {type: 'geojson', data: EMPTY});
      m.addLayer({
        id: `${ZONE_SOURCE}-fill`,
        type: 'fill',
        source: ZONE_SOURCE,
        paint: {'fill-color': flame, 'fill-opacity': 0.14},
      });
      m.addLayer({
        id: `${ZONE_SOURCE}-line`,
        type: 'line',
        source: ZONE_SOURCE,
        paint: {
          'line-color': flame,
          'line-width': 2,
          'line-dasharray': [
            'case',
            ['==', ['get', 'preview'], true],
            ['literal', [2, 2]],
            ['literal', [1, 0]],
          ],
        },
      });
      loaded.current = true;
      for (const task of pending.current.splice(0)) task();
      fit();
    });

    // MapLibre only tracks window resizes; layouts here resize the container too.
    // Until the admin moves the map, keep the zone and pin framed.
    let moved = false;
    m.on('dragstart', () => (moved = true));
    m.on('zoomstart', event => {
      if ((event as {originalEvent?: unknown}).originalEvent) moved = true;
    });
    const resize = new ResizeObserver(() => {
      m.resize();
      if (!moved && loaded.current) fit();
    });
    resize.observe(container.current);

    m.on('click', event => {
      const {onProbe: probeAt, onPinChange: movePin, drawing: drawingNow} = latest.current;
      if (drawingNow) return;
      const at = roundPin({lat: event.lngLat.lat, lng: event.lngLat.lng});
      if (probeAt) probeAt(at);
      else if (movePin) movePin(at);
    });

    return () => {
      resize.disconnect();
      draw.current?.stop();
      draw.current = null;
      m.remove();
      map.current = null;
      loaded.current = false;
      pending.current = [];
      pinMarker.current = null;
      probeMarker.current = null;
    };
    // fallbackCenter only seeds the first view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);

  // Store pin. Depends on the numbers, not the object, which callers re-create each render.
  const pinLat = pin?.lat;
  const pinLng = pin?.lng;
  const draggable = Boolean(onPinChange);
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (pinLat === undefined || pinLng === undefined) {
      pinMarker.current?.remove();
      pinMarker.current = null;
      return;
    }
    if (!pinMarker.current) {
      const element = document.createElement('div');
      element.className =
        'size-5 rounded-pill border-[3px] border-surface bg-primary shadow-raised cursor-grab';
      element.setAttribute('aria-hidden', 'true');
      const marker = new Marker({element, draggable}).setLngLat([pinLng, pinLat]).addTo(m);
      marker.on('dragend', () => {
        const at = marker.getLngLat();
        latest.current.onPinChange?.(roundPin({lat: at.lat, lng: at.lng}));
      });
      pinMarker.current = marker;
    } else {
      pinMarker.current.setLngLat([pinLng, pinLat]);
      pinMarker.current.setDraggable(draggable);
    }
    // Typed or pasted coordinates can land off-screen: bring the pin into view.
    if (loaded.current && !m.getBounds().contains([pinLng, pinLat])) {
      m.easeTo({center: [pinLng, pinLat], zoom: Math.max(m.getZoom(), 12), duration: 300});
    }
  }, [pinLat, pinLng, draggable, dark]);

  // Probe pin.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (!probe) {
      probeMarker.current?.remove();
      probeMarker.current = null;
      return;
    }
    if (!probeMarker.current) {
      const color = container.current
        ? token(container.current, '--sky-strong', '#1D5BD8')
        : undefined;
      probeMarker.current = new Marker({color}).setLngLat([probe.lng, probe.lat]).addTo(m);
    } else probeMarker.current.setLngLat([probe.lng, probe.lat]);
  }, [probe, dark]);

  // Zone layer (hidden while drawing: the drawing tools show the outlines).
  const drawingOn = Boolean(drawing);
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const apply = () => {
      const source = m.getSource<GeoJSONSource>(ZONE_SOURCE);
      source?.setData(
        zone && !drawingOn
          ? {type: 'Feature', geometry: zone, properties: {preview: Boolean(zonePreview)}}
          : EMPTY
      );
    };
    whenLoaded(apply);
  }, [zone, zonePreview, drawingOn, dark]);

  // Drawing tools: start when drawing begins, stop when it ends.
  useEffect(() => {
    const m = map.current;
    if (!m || !drawingOn) return;
    const start = () => {
      const element = container.current ?? document.body;
      const flame = token(element, '--flame', '#FF550C');
      const ink = token(element, '--night', '#0B0B0B');
      const surface = token(element, '--surface', '#FFFFFF');
      const d = new TerraDraw({
        adapter: new TerraDrawMapLibreGLAdapter({map: m, coordinatePrecision: 6}),
        modes: [
          new TerraDrawPolygonMode({
            styles: {
              fillColor: flame,
              fillOpacity: 0.18,
              outlineColor: flame,
              outlineWidth: 2,
              closingPointColor: surface,
              closingPointOutlineColor: flame,
              closingPointWidth: 6,
              closingPointOutlineWidth: 2,
            },
          }),
          new TerraDrawSelectMode({
            flags: {
              polygon: {
                feature: {
                  draggable: true,
                  coordinates: {midpoints: true, draggable: true, deletable: true},
                },
              },
            },
            styles: {
              selectedPolygonColor: flame,
              selectedPolygonFillOpacity: 0.24,
              selectedPolygonOutlineColor: ink,
              selectedPolygonOutlineWidth: 2,
              selectionPointColor: surface,
              selectionPointOutlineColor: ink,
              selectionPointWidth: 5,
              selectionPointOutlineWidth: 2,
              midPointColor: flame,
              midPointOutlineColor: surface,
              midPointWidth: 4,
            },
          }),
        ],
      });
      d.start();
      const initial = latest.current.drawing?.initial ?? [];
      if (initial.length) {
        d.addFeatures(
          initial.map(ring => ({
            id: crypto.randomUUID(),
            type: 'Feature',
            geometry: {type: 'Polygon', coordinates: [ring]},
            properties: {mode: 'polygon'},
          }))
        );
      }
      d.setMode(latest.current.drawing?.mode ?? 'polygon');
      d.on('change', () => latest.current.drawing?.onChange(finishedOutlines(d.getSnapshot())));
      draw.current = d;
    };
    let cancelled = false;
    whenLoaded(() => {
      if (!cancelled) start();
    });
    return () => {
      cancelled = true;
      draw.current?.stop();
      draw.current = null;
    };
  }, [drawingOn, dark]);

  // Switch drawing mode.
  const mode = drawing?.mode;
  useEffect(() => {
    if (mode && draw.current?.enabled) draw.current.setMode(mode);
  }, [mode]);

  return (
    <div
      ref={container}
      role="region"
      aria-label={label}
      className={cn(
        'relative h-full min-h-80 w-full overflow-hidden rounded-md bg-surface-sunken',
        className
      )}
    />
  );
}

function finishedOutlines(features: GeoJSONStoreFeatures[]): Position[][] {
  return features.flatMap(feature => {
    if (feature.geometry.type !== 'Polygon') return [];
    if (feature.properties.currentlyDrawing) return [];
    const ring = feature.geometry.coordinates[0];
    if (!ring || ring.length < 4) return [];
    return [ring.map(([lng, lat]) => [lng ?? 0, lat ?? 0] as Position)];
  });
}
