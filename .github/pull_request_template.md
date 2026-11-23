## What and why

<!-- One concern per PR. Link the decision (D-number), Figma frame or project doc. -->

## Project(s)

<!-- e.g. admin, shared; say explicitly if tooling, CI, eslint or check:arch changed -->

## Screens

<!-- Screenshots or a short recording, light and dark, phone and desktop for UI changes. -->

## Checklist

- [ ] `yarn verify` passes (or `yarn check:arch && yarn nx affected -t lint typecheck test build`)
- [ ] New API calls go through `@grov/api` + `@grov/hooks`; types come from `@grov/models` (regenerated if the spec changed)
- [ ] Tokens only (no palette colours or hex); checked in light and dark
- [ ] Accessible: labels, focus order, keyboard, 48px targets, screen-reader names on icon buttons
- [ ] Prices show their status; money from integer kobo; budget overage is neutral (grov-design non-negotiables)
- [ ] Admin pages/actions declare their permissions (`handle.requires`, `<Can>`), using `PERMISSIONS.*`
- [ ] No tokens, PII or secrets in storage, logs or `VITE_*`
- [ ] Tests for new behaviour; a failing-first test for bug fixes
- [ ] Docs updated if a rule, route or contract changed

## Risk and rollout

<!-- Backend changes this depends on, env variables to set, feature flags -->
