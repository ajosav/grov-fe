import {type ClassValue, clsx} from 'clsx';
import {extendTailwindMerge} from 'tailwind-merge';

// Teach tailwind-merge the Grov type scale so `text-body text-ink` keeps both
// (size vs colour) and `text-body text-title-sm` keeps the last size.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-xl',
            'display-lg',
            'title-lg',
            'title-md',
            'title-sm',
            'body-lg',
            'body',
            'body-sm',
            'label',
            'chip',
            'money',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
