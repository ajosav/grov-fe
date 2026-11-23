# Forms

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

react-hook-form + zod (`@hookform/resolvers/zod`) + `<Field>`. Formik and Yup are banned **[enforced]**.

```tsx
const schema = z.object({
  name: z.string().trim().min(1, 'Name the role').max(80),
  phone: z
    .string()
    .refine(v => toE164Nigeria(v) !== null, 'Enter a Nigerian phone number, like 0803 123 4567'),
});

export function ContactForm() {
  const save = useSaveContact();
  const form = useForm({resolver: zodResolver(schema), defaultValues: {name: '', phone: ''}});

  const submit = form.handleSubmit(values =>
    save.mutate(
      {...values, phone: toE164Nigeria(values.phone) ?? values.phone},
      {
        onError: error => {
          if (!isApiError(error)) return;
          for (const field of ['name', 'phone'] as const) {
            const message = error.fieldError(field);
            if (message) form.setError(field, {message});
          }
        },
      }
    )
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <Field label="Name" error={form.formState.errors.name?.message}>
        <Input autoComplete="name" {...form.register('name')} />
      </Field>
      <Field
        label="Phone"
        hint="The rider calls this number."
        error={form.formState.errors.phone?.message}
      >
        <PhoneInput {...form.register('phone')} />
      </Field>
      {save.isError ? <Alert tone="danger">{errorMessage(save.error)}</Alert> : null}
      <Button type="submit" loading={save.isPending}>
        Save
      </Button>
    </form>
  );
}
```

## Rules

- Every labelled control sits in `<Field>`: it wires `id`, `aria-describedby`, `aria-invalid` and the error text.
- `noValidate` on the form; zod gives fast feedback, the server decides. Server `fieldErrors` (422 `VALIDATION_FAILED`) win and are mapped back onto fields; anything else shows `errorMessage()` once, above the submit.
- Schemas mirror grov-be's limits (max lengths, formats). Put them next to the form, or in `@grov/shared` when two forms share them (e.g. `passwordSchema`).
- Messages say what to do ("Enter your first name"), not what's wrong ("Invalid").
- Correct `type`, `autoComplete`, `inputMode` on every input (email, `one-time-code`, `tel-national`, `new-password`, `current-password`).
- The submit button shows `loading` (disables and sets `aria-busy`) while pending; never double-submit a creating request (idempotency: `data.md`).
- Normalise before sending (phones to E.164, emails trimmed and lower-cased); send kobo integers for money.
- One question per screen in set-up and sign-in flows (D38); `autoFocus` only on that one field.
