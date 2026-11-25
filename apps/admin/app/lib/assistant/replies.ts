import {paths} from '../../paths';

export interface AssistantReply {
  text: string;
  link: {to: string; label: string};
}

interface Topic {
  match: RegExp;
  reply: AssistantReply;
}

const TOPICS: Topic[] = [
  {
    match: /thin|margin|profit/i,
    reply: {
      text: 'Margins by product are in the catalogue, already filtered to the thin ones.',
      link: {to: `${paths.products}?profitability=thin`, label: 'Products with thin margins'},
    },
  },
  {
    match: /less|declin|drop|fall|fell|down/i,
    reply: {
      text: 'The products whose revenue fell against the previous period are in the catalogue.',
      link: {to: `${paths.products}?view=declining`, label: 'Declining products'},
    },
  },
  {
    match: /restock|stock|low|out of|run out|inventory/i,
    reply: {
      text: 'Low and out-of-stock products are in the catalogue, ready to restock.',
      link: {to: `${paths.products}?view=low_stock`, label: 'Low-stock products'},
    },
  },
  {
    match: /market|commodit|scarc|harvest|season|price/i,
    reply: {
      text: 'Market and price intelligence needs data sources that aren’t connected yet. Your own price changes are in the recent changes list.',
      link: {to: paths.productIntelligence, label: 'Intelligence centre'},
    },
  },
  {
    match: /sale|revenue|order|week|today|month|buyer|customer/i,
    reply: {
      text: 'Sales, orders and buyers by day, against the previous period, are in Analytics.',
      link: {to: paths.productAnalytics, label: 'Product analytics'},
    },
  },
];

const FALLBACK: AssistantReply = {
  text: 'The numbers behind most questions are in Analytics.',
  link: {to: paths.productAnalytics, label: 'Product analytics'},
};

const PREFIX = 'I can’t answer that yet because AI isn’t switched on. ';

/**
 * What the assistant says while there is no AI behind it: it says so plainly and points to the
 * page that holds the answer. It never guesses a number. Replaced by the real assistant (doc 38 M6).
 */
export function replyTo(question: string): AssistantReply {
  const topic = TOPICS.find(t => t.match.test(question))?.reply ?? FALLBACK;
  return {text: PREFIX + topic.text, link: topic.link};
}
