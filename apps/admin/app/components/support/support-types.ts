/**
 * Support inbox shapes. Front-end only until grov-be's `support` module ships
 * (see "Support in the admin console"); then these come from @grov/models.
 */
export type ConversationStatus = 'OPEN' | 'PENDING' | 'RESOLVED';

export type ConversationCategory =
  'ORDER_ISSUE' | 'DELIVERY' | 'REFUND' | 'ACCOUNT' | 'FOOD_BALANCE' | 'PLAN' | 'OTHER';

export type ConversationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP';

export interface SupportCustomer {
  id: string;
  name: string;
  email: string;
  /** E.164 */
  phone: string;
  city: string;
  storeName: string;
  household: string;
  /** Integer kobo. */
  foodBalanceKobo: number;
  openOrder?: {number: string; totalKobo: number; nextDelivery: string};
}

export interface SupportMessage {
  id: string;
  author: 'CUSTOMER' | 'STAFF' | 'SYSTEM';
  authorName: string;
  /** NOTE = staff only. EVENT = status, assignment, refund lines. */
  kind: 'REPLY' | 'NOTE' | 'EVENT';
  body: string;
  /** ISO time. */
  at: string;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  number: string;
  subject: string;
  category: ConversationCategory;
  status: ConversationStatus;
  priority: 'NORMAL' | 'HIGH';
  channel: ConversationChannel;
  customer: SupportCustomer;
  /** Staff name; null = unassigned. */
  assignee: string | null;
  orderNumber?: string;
  /** The customer wrote since staff last looked. */
  unread: boolean;
  /** ISO time the next reply is due. */
  dueAt: string;
  /** ISO time the customer raised it. */
  createdAt: string;
  /** Started after an older conversation was closed (a reply after the reopen window). */
  followsId?: string;
  /** Separate issues an admin tied together (both sides list each other). */
  relatedIds?: string[];
  /** Merged into another conversation: read-only, hidden from the inbox. */
  mergedIntoId?: string;
  messages: SupportMessage[];
}

export interface Macro {
  id: string;
  title: string;
  body: string;
}

export const CATEGORY_LABEL: Record<ConversationCategory, string> = {
  ORDER_ISSUE: 'Order issue',
  DELIVERY: 'Delivery',
  REFUND: 'Refund',
  ACCOUNT: 'Account',
  FOOD_BALANCE: 'Food balance',
  PLAN: 'Plan',
  OTHER: 'Other',
};

export const STATUS_LABEL: Record<ConversationStatus, string> = {
  OPEN: 'Open',
  PENDING: 'Waiting on customer',
  RESOLVED: 'Resolved',
};

export const CHANNEL_LABEL: Record<ConversationChannel, string> = {
  IN_APP: 'In app',
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
};
