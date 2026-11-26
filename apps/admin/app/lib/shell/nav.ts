import type {ComponentType} from 'react';

import {
  Apple,
  ArrowLeftRight,
  Boxes,
  CalendarClock,
  ChefHat,
  ClipboardCheck,
  CookingPot,
  FlaskConical,
  FolderTree,
  GitPullRequestArrow,
  History,
  House,
  Layers,
  LayoutDashboard,
  ListChecks,
  MapPin,
  MapPinned,
  MessageSquareQuote,
  Package,
  PackagePlus,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Store,
  Tractor,
  Truck,
  UsersRound,
  Warehouse,
} from 'lucide-react';
import {matchPath} from 'react-router';

import {PERMISSIONS} from '@grov/models';
import type {PermissionRequirement} from '@grov/shared';

import {paths} from '../../paths';

export type NavIcon = ComponentType<{className?: string; 'aria-hidden'?: boolean}>;

/** A page in the console. */
export interface NavPage {
  kind: 'page';
  to: string;
  label: string;
  icon: NavIcon;
  /** Same requirement as the page's route `handle`, so nobody sees a link they can't open. */
  requires?: PermissionRequirement;
  /** Match only the exact path (the dashboard). */
  end?: boolean;
  /** Acts on the working store chosen in the sidebar (ADR 0001 §7). */
  storeScoped?: boolean;
  /** Extra words the ⌘K search matches. */
  keywords?: string[];
  /** Other paths that belong to this page, e.g. views reached from its own tabs. */
  also?: string[];
}

/** A section the sidebar drills into (AI SDK style). Sections can nest. */
export interface NavSection {
  kind: 'section';
  id: string;
  label: string;
  icon: NavIcon;
  children: NavEntry[];
}

export type NavEntry = NavPage | NavSection;

export interface NavGroup {
  label?: string;
  entries: NavEntry[];
}

const page = (p: Omit<NavPage, 'kind'>): NavPage => ({kind: 'page', ...p});
const section = (s: Omit<NavSection, 'kind'>): NavSection => ({kind: 'section', ...s});

export const ADMIN_NAV: NavGroup[] = [
  {
    entries: [
      page({to: paths.dashboard, label: 'Dashboard', icon: LayoutDashboard, end: true}),
      page({
        to: paths.orders,
        label: 'Orders',
        icon: ReceiptText,
        requires: {allOf: [PERMISSIONS.ORDERS.READ]},
        storeScoped: true,
        keywords: ['drops', 'deliveries'],
      }),
    ],
  },
  {
    label: 'Commerce',
    entries: [
      section({
        id: 'catalogue',
        label: 'Catalogue',
        icon: Package,
        children: [
          page({
            to: paths.products,
            label: 'Products',
            icon: Package,
            requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
            keywords: [
              'sizes',
              'items',
              'analytics',
              'intelligence',
              'recommendations',
              'insights',
            ],
            also: [paths.productAnalytics, paths.productIntelligence],
          }),
          page({
            to: paths.categories,
            label: 'Categories',
            icon: FolderTree,
            requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
          }),
          page({
            to: paths.listings,
            label: 'Store listings',
            icon: ListChecks,
            requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
            storeScoped: true,
            keywords: ['list', 'delist', 'pause'],
          }),
          page({
            to: paths.shopperRequests,
            label: 'Shopper requests',
            icon: MessageSquareQuote,
            requires: {allOf: [PERMISSIONS.SHOP.REQUESTS_READ]},
          }),
        ],
      }),
      section({
        id: 'stock',
        label: 'Stock',
        icon: Warehouse,
        children: [
          page({
            to: paths.stockLevels,
            label: 'Stock levels',
            icon: Boxes,
            requires: {allOf: [PERMISSIONS.STOCK.READ]},
            storeScoped: true,
            keywords: ['inventory', 'on hand'],
          }),
          page({
            to: paths.stockRestock,
            label: 'Restock planner',
            icon: CalendarClock,
            requires: {allOf: [PERMISSIONS.STOCK.READ]},
            storeScoped: true,
            keywords: ['reorder', 'buy', 'purchase', 'shopping list'],
          }),
          page({
            to: paths.stockMovements,
            label: 'Movements',
            icon: ArrowLeftRight,
            requires: {allOf: [PERMISSIONS.STOCK.READ]},
            storeScoped: true,
            keywords: ['transfers', 'write-offs', 'adjustments'],
          }),
          page({
            to: paths.stockReceipts,
            label: 'Receive stock',
            icon: PackagePlus,
            requires: {allOf: [PERMISSIONS.STOCK.RECEIVE]},
            storeScoped: true,
            keywords: ['delivery', 'grn', 'goods received', 'purchase'],
          }),
          page({
            to: paths.stockGrns,
            label: 'Goods received',
            icon: ReceiptText,
            requires: {allOf: [PERMISSIONS.STOCK.READ]},
            storeScoped: true,
            keywords: ['grn', 'delivery notes', 'landed cost'],
          }),
          page({
            to: paths.stockBatches,
            label: 'Batches',
            icon: Layers,
            requires: {allOf: [PERMISSIONS.STOCK.READ]},
            storeScoped: true,
            keywords: ['lots', 'expiry', 'harvest', 'traceability'],
          }),
          page({
            to: paths.stockTransfers,
            label: 'Transfers',
            icon: Truck,
            requires: {allOf: [PERMISSIONS.STOCK.READ]},
            storeScoped: true,
            keywords: ['move stock', 'dispatch', 'in transit'],
          }),
          page({
            to: paths.stockCounts,
            label: 'Stock counts',
            icon: ClipboardCheck,
            requires: {allOf: [PERMISSIONS.STOCK.READ]},
            storeScoped: true,
            keywords: ['stocktake', 'cycle count', 'variance'],
          }),
          page({
            to: paths.stockLocations,
            label: 'Locations',
            icon: MapPin,
            requires: {allOf: [PERMISSIONS.STOCK.READ]},
            storeScoped: true,
            keywords: ['warehouse', 'cold room', 'bays', 'quarantine'],
          }),
          page({
            to: paths.suppliers,
            label: 'Suppliers',
            icon: Tractor,
            requires: {allOf: [PERMISSIONS.SUPPLIERS.READ]},
            keywords: ['farms', 'vendors', 'sources'],
          }),
        ],
      }),
    ],
  },
  {
    label: 'Food and planning',
    entries: [
      section({
        id: 'meals',
        label: 'Meals',
        icon: ChefHat,
        children: [
          page({
            to: paths.foods,
            label: 'Foods',
            icon: Apple,
            requires: {allOf: [PERMISSIONS.FOODS.READ]},
            keywords: ['allergens', 'substitutes'],
          }),
          page({
            to: paths.meals,
            label: 'Meals',
            icon: CookingPot,
            requires: {allOf: [PERMISSIONS.MEALS.READ]},
            keywords: ['recipes', 'dishes'],
          }),
        ],
      }),
      section({
        id: 'planning',
        label: 'Planning',
        icon: Sparkles,
        children: [
          page({
            to: paths.householdPlans,
            label: 'Household plans',
            icon: House,
            requires: {allOf: [PERMISSIONS.PLANNING.READ]},
          }),
          page({
            to: paths.householdExtras,
            label: 'Household extras',
            icon: ShoppingBasket,
            requires: {allOf: [PERMISSIONS.PLANNING.EXTRAS_MANAGE]},
            keywords: ['tea', 'sugar', 'bread'],
          }),
          page({
            to: paths.planPreview,
            label: 'Plan preview',
            icon: FlaskConical,
            requires: {allOf: [PERMISSIONS.PLANNING.PREVIEW]},
          }),
          page({
            to: paths.generationLog,
            label: 'How plans were chosen',
            icon: History,
            requires: {allOf: [PERMISSIONS.PLANNING.GENERATION_READ]},
            keywords: ['generation', 'scores', 'replay'],
          }),
          page({
            to: paths.plannerChanges,
            label: 'Planner change requests',
            icon: GitPullRequestArrow,
            requires: {
              anyOf: [
                PERMISSIONS.PLANNING.GENERATION_REQUEST_CHANGE,
                PERMISSIONS.PLANNING.GENERATION_REVIEW,
              ],
            },
          }),
        ],
      }),
    ],
  },
  {
    label: 'Administration',
    entries: [
      section({
        id: 'stores',
        label: 'Stores',
        icon: Store,
        children: [
          page({
            to: paths.stores,
            label: 'Stores',
            icon: Store,
            requires: {allOf: [PERMISSIONS.STORES.READ]},
            keywords: ['delivery zones', 'coverage'],
          }),
          page({
            to: paths.cities,
            label: 'Cities',
            icon: MapPinned,
            requires: {allOf: [PERMISSIONS.STORES.MANAGE]},
          }),
        ],
      }),
      section({
        id: 'access',
        label: 'Access',
        icon: ShieldCheck,
        children: [
          page({
            to: paths.staff,
            label: 'Staff',
            icon: UsersRound,
            requires: {allOf: [PERMISSIONS.ACCESS.STAFF_READ]},
            keywords: ['admins', 'invite', 'team', 'people'],
          }),
          page({
            to: paths.roles,
            label: 'Roles and permissions',
            icon: ShieldCheck,
            requires: {allOf: [PERMISSIONS.ACCESS.ROLES_READ]},
          }),
          page({
            to: paths.auditLogs,
            label: 'Audit logs',
            icon: ScrollText,
            requires: {allOf: [PERMISSIONS.AUDIT.LOGS_READ]},
            keywords: ['history', 'changes', 'activity', 'who did', 'log'],
          }),
        ],
      }),
    ],
  },
];

/** Pinned to the bottom of the sidebar. */
export const ADMIN_NAV_FOOTER: NavPage[] = [
  page({to: paths.settings, label: 'Settings', icon: Settings, keywords: ['theme', 'appearance']}),
];

type Check = (requirement: PermissionRequirement) => boolean;

/** Drops pages the admin can't open and sections left empty. */
export function visibleEntries(entries: NavEntry[], check: Check): NavEntry[] {
  return entries.flatMap<NavEntry>(entry => {
    if (entry.kind === 'page') return !entry.requires || check(entry.requires) ? [entry] : [];
    const children = visibleEntries(entry.children, check);
    return children.length ? [{...entry, children}] : [];
  });
}

export function visibleNav(check: Check): {groups: NavGroup[]; footer: NavPage[]} {
  return {
    groups: ADMIN_NAV.map(g => ({...g, entries: visibleEntries(g.entries, check)})).filter(
      g => g.entries.length > 0
    ),
    footer: ADMIN_NAV_FOOTER.filter(p => !p.requires || check(p.requires)),
  };
}

export function firstPage(entry: NavEntry): NavPage | undefined {
  if (entry.kind === 'page') return entry;
  for (const child of entry.children) {
    const found = firstPage(child);
    if (found) return found;
  }
  return undefined;
}

export interface NavTrail {
  sections: NavSection[];
  page: NavPage;
}

export function flattenNav(entries: NavEntry[], sections: NavSection[] = []): NavTrail[] {
  return entries.flatMap(entry =>
    entry.kind === 'page'
      ? [{sections, page: entry}]
      : flattenNav(entry.children, [...sections, entry])
  );
}

export function activeTrail(trails: NavTrail[], pathname: string): NavTrail | undefined {
  return trails
    .flatMap(trail =>
      [trail.page.to, ...(trail.page.also ?? [])]
        .filter(path => matchPath({path, end: trail.page.end ?? false}, pathname))
        .map(path => ({trail, length: path.length}))
    )
    .sort((a, b) => b.length - a.length)[0]?.trail;
}
