import type {ComponentType} from 'react';

import {
  Apple,
  ArrowLeftRight,
  Boxes,
  ChefHat,
  CookingPot,
  FlaskConical,
  FolderTree,
  GitPullRequestArrow,
  History,
  House,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  MessageSquareQuote,
  Package,
  PackagePlus,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Store,
  UsersRound,
  Warehouse,
} from 'lucide-react';
import {matchPath} from 'react-router';

import {PERMISSIONS} from '@grov/models';
import type {PermissionRequirement} from '@grov/shared';

import {paths} from '../paths';

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
  /** Small heading above the group on the root panel. */
  label?: string;
  entries: NavEntry[];
}

const page = (p: Omit<NavPage, 'kind'>): NavPage => ({kind: 'page', ...p});
const section = (s: Omit<NavSection, 'kind'>): NavSection => ({kind: 'section', ...s});

/**
 * The admin console's information architecture. A page appears only when its
 * route exists; a section appears only when at least one page in it is visible.
 */
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
            keywords: ['sizes', 'items'],
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
            requires: {allOf: [PERMISSIONS.STOCK.WRITE]},
            storeScoped: true,
            keywords: ['receipts', 'counts'],
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
            requires: {allOf: [PERMISSIONS.CITIES.MANAGE]},
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

/** First page inside a section: where clicking the section goes. */
export function firstPage(entry: NavEntry): NavPage | undefined {
  if (entry.kind === 'page') return entry;
  for (const child of entry.children) {
    const found = firstPage(child);
    if (found) return found;
  }
  return undefined;
}

export interface NavTrail {
  /** Sections from the root down to the page. */
  sections: NavSection[];
  page: NavPage;
}

/** Every visible page with the sections above it (breadcrumbs, ⌘K). */
export function flattenNav(entries: NavEntry[], sections: NavSection[] = []): NavTrail[] {
  return entries.flatMap(entry =>
    entry.kind === 'page'
      ? [{sections, page: entry}]
      : flattenNav(entry.children, [...sections, entry])
  );
}

/** The page the URL is on (longest match wins), or undefined for pages outside the nav. */
export function activeTrail(trails: NavTrail[], pathname: string): NavTrail | undefined {
  return trails
    .filter(({page: p}) => matchPath({path: p.to, end: p.end ?? false}, pathname))
    .sort((a, b) => b.page.to.length - a.page.to.length)[0];
}
