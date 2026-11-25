import {z} from 'zod';

import {toE164Nigeria} from '@grov/ui';

export type Mode = 'EXISTING' | 'CHOOSE' | 'NEW';

const fields = z.object({
  password: z.string(),
  confirm: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  terms: z.boolean(),
});

export type InviteValues = z.infer<typeof fields>;

/** One form; what it asks for depends on whether the account exists and has a password. */
export function inviteSchemaFor(mode: Mode) {
  return fields.superRefine((values, ctx) => {
    const issue = (path: keyof InviteValues, message: string) =>
      ctx.addIssue({code: 'custom', path: [path], message});
    if (mode === 'EXISTING') {
      if (!values.password) issue('password', 'Enter your password');
      return;
    }
    if (values.password.length < 8) issue('password', 'Use at least 8 characters with a symbol');
    if (mode === 'CHOOSE' && values.password !== values.confirm) {
      issue('confirm', 'The passwords don’t match');
    }
    if (mode === 'NEW') {
      if (!values.firstName.trim()) issue('firstName', 'Enter your first name');
      if (toE164Nigeria(values.phone) === null) {
        issue('phone', 'Enter a Nigerian phone number, like 0803 123 4567');
      }
      if (!values.terms) issue('terms', 'Accept the terms to continue');
    }
  });
}
