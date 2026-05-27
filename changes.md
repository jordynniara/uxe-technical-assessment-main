# Assessment Changes

A running log of changes made to the base project as part of the UXE technical assessment. Tracked on the `asses-react` branch (base committed on `master`).

## Setup fixes

### 1. Fixed custom element typings for React 19

**File:** [apps/tech-assessment-react/app/custom-elements.d.ts](apps/tech-assessment-react/app/custom-elements.d.ts)

The starter declared Lift custom elements (`atp-header`, `atp-sidebar`, etc.) on the **global** `JSX` namespace:

```ts
declare global {
  namespace JSX {
    interface IntrinsicElements { ... }
  }
}
```

This pattern worked in older versions of `@types/react`, but starting with `@types/react` v19 the `JSX` namespace lives **inside the `react` module** — there is no global `JSX` namespace anymore. As a result the augmentation had no effect and every `<atp-*>` tag produced a TypeScript error:

> Property 'atp-header' does not exist on type 'JSX.IntrinsicElements'.

**Fix:** switched to module augmentation against `'react'`:

```ts
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements { ... }
  }
}
```

This merges the custom element entries into React's actual `IntrinsicElements` interface, restoring type support for Lift web components throughout the app.

### 2. Removed unused `title` prop from `<Welcome />`

**File:** [apps/tech-assessment-react/app/app.tsx](apps/tech-assessment-react/app/app.tsx)

`app.tsx` was passing a `title` prop to `<Welcome />`, but the `Welcome` component in [welcome.tsx](apps/tech-assessment-react/app/welcome.tsx) does not accept any props. This caused a TypeScript build error:

> Type '{ title: string; }' is not assignable to type 'IntrinsicAttributes'.
> Property 'title' does not exist on type 'IntrinsicAttributes'.

**Fix:** removed the unused prop so the call matches the component's signature.

```diff
-      <Welcome title="Tech-assessment-react" />
+      <Welcome />
```

## Refactors

### 3. Replaced `getElementById` with `useRef` in `DeliveryConfigurationCreateRoute`

**Files:**
- [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx)
- [apps/tech-assessment-react/app/custom-elements.d.ts](apps/tech-assessment-react/app/custom-elements.d.ts)

The starter used `document.getElementById('delivery-config-sidebar')` inside `useEffect` to access the Lift web components and set their object/array properties (`items`, `activeId`, etc.). That pattern has several problems:

- Searches the global `document` — easy to collide with another component's ids
- Requires inventing and maintaining unique ids across the app
- Wouldn't survive SSR if the lookup ever moved outside `useEffect` (`document` is undefined on the server)
- Doesn't scale to multiple instances of the same component
- Repeats the `as HTMLElementTagNameMap['atp-*'] | null` cast at every call site

**Fix:** switched to `useRef`, the React-native way to imperatively reach a DOM node. Each custom element gets a typed ref declared once; effects read `ref.current` directly:

```tsx
const sidebarRef = useRef<HTMLElementTagNameMap['atp-sidebar']>(null);

useEffect(() => {
  if (sidebarRef.current) {
    sidebarRef.current.items = SIDEBAR_ITEMS;
  }
}, []);

return <atp-sidebar ref={sidebarRef} />;
```

To make `ref` valid on the custom elements, [custom-elements.d.ts](apps/tech-assessment-react/app/custom-elements.d.ts) was updated to declare them with `DetailedHTMLProps<HTMLAttributes<T>, T>` instead of bare `HTMLAttributes<HTMLElement>`. The bare form omits the `ref` attribute, which is added by `DetailedHTMLProps`. The element types now use the actual class types from `HTMLElementTagNameMap` (e.g. `Sidebar`, `Header`, `Breadcrumbs`) provided by `@atpco/atp-web`, giving stronger typing on `ref.current`.

The `id` attributes on `<atp-header>`, `<atp-sidebar>`, and `<atp-breadcrumbs>` were removed since they were only there to support the old lookup.

## Feature work

### 4. Deprecated design-system components used due to installed library version

**Files:** [package.json](package.json), [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx)

The project pins `@atpco/atp-web@0.17.0` (loaded from the local tarball at [vendor/atp-web/atpco-atp-web-0.17.0.tgz](vendor/atp-web/atpco-atp-web-0.17.0.tgz)), but the public design-system docs the assessment links to are built from a newer release (~v0.19). One component was renamed between those versions:

| v0.17 (used here) | v0.19 (docs) |
| --- | --- |
| `atp-input` | `atp-input-field` |
| ... |  |


### 5. Built the create delivery-configuration form

**File:** [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx)

Implemented the full form per [apps/tech-assessment-api/schema.md](apps/tech-assessment-api/schema.md):

- Always-rendered fields: delivery configuration name, customer, delivery frequency (cron, with help-text link), last file suffix, delivery file name.
- Delivery location is a select-style dropdown (`<atp-input>` + slotted `<atp-dropdown>`); defaults to **S3** via `useState('s3')`.
- Conditional **location details card** appears when a delivery location is selected, swapping between email fields (`recipient`, `subject`, `body`) and cloud fields (`bucket`, `credentialsFile`, `uploadOption`) based on the selection.
- Four boolean option checkboxes: **Combine files**, **Place files into specific delivery directory**, **Virus scan**, **Use encryption**.
- Conditional **combine-files card** appears under Combine files, containing `maximumFileSize` (number) and a `compression` checkbox.
- Submit button at the bottom; on submit, the form's full state is assembled into a single payload object and `console.log`'d (server call to be wired in next).

### 6. Extracted `AtpDropdownField` and `AtpCheckbox` wrapper components

**File:** [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx)

The atp-web components are Lit-based and expose state via imperative properties + custom events (e.g. `activeIds`, `itemSelectedOutput`, `changeEventOutput`), not React-style props. Wiring each instance up directly meant ~10 lines of boilerplate per field (ref + two `useEffect`s).

Two small wrapper components consolidate that interop:

- **`AtpCheckbox`** — takes React-idiomatic `label`, `checked`, `onChange` props. Internally pushes `checked` to the web component via `useEffect` and listens for `changeEventOutput`. Used for all five checkboxes on the form.
- **`AtpDropdownField`** — takes `items`, `value`, `onChange`, `label`, `id`, `name`, `required` props. Owns the input + dropdown refs, sets `itemsList` and `required` on mount, syncs `activeIds` on value change, and listens for `itemSelectedOutput`. Computes the visible display value from the item list internally.

Result: the form route's JSX reads as plain controlled-component React; the web-component plumbing is isolated to one place per element type.

### 7. Submit wiring through `atp-button`

**File:** [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx)

`<atp-button>` doesn't behave like a native `type="submit"` — it dispatches its own `clickEventOutput` custom event instead of submitting the enclosing form. To keep the conventional form pattern working:

- The form has `onSubmit` with `event.preventDefault()` + call to `handleSubmit()` (preserves keyboard submit via Enter inside text inputs).
- A `useEffect` also listens for the button's `clickEventOutput` via ref and calls `handleSubmit()` (covers mouse click on the button).

`handleSubmit` is a `useCallback` that builds a single payload object containing only the relevant fields for the current `deliveryLocation` and `combineFiles` state, then `console.log`'s it. A `// TODO` comment marks where the POST request will go.

### 8. Required-field marker via callback ref

**File:** [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx)

Originally each required input had its own `useRef` plus a setter inside the mount `useEffect`, which doesn't work for conditionally-rendered inputs (the ref is `null` at mount time).

Replaced with a single shared `requiredInputRef` (a `useCallback` callback ref) that flips `el.required = true` on every mount — works equally well for the always-rendered and the conditionally-rendered (email/cloud, combine-files) inputs. A sibling `requiredTextareaInputRef` adds `el.textarea = true` for the email body field.

### 9. Validation moved from `onChange` to `onBlur`

**File:** [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx)

Fields with format constraints (`deliveryFrequency` → cron, `lastFileSuffix` / `deliveryFileName` → file-safe chars, `recipient` → email) originally validated synchronously inside `onChange` and refused to update state when invalid. Because the inputs are controlled, that meant partial values like `a@b` (en route to `a@b.com`) couldn't be typed at all — the field appeared stuck.

Fix: `onChange` now always commits the user's keystrokes to state; validation runs in `onBlur`, only when the user leaves the field. Empty-on-blur is not treated as an error (required-field handling is a separate concern). The shared `validateInput` helper at the bottom of the file holds the regex per input kind.

### 10. CSS Module integration

**Files:** [apps/tech-assessment-react/app/app.module.css](apps/tech-assessment-react/app/app.module.css), [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx)

Form-specific styles live in `app.module.css` per the assessment instructions. Two gotchas resolved:

- CSS Module class names are hashed at build time, so the route imports the module (`import styles from './../app.module.css'`) and uses `className={styles.deliveryConfigForm}` rather than a plain string.
- Flex `gap` on the form doesn't reach into `<atp-card>` contents because the card renders its slot inside its own shadow DOM. Solution: wrap each card's children in a `<div className={styles.cardContent}>` whose own `display: flex; gap` applies to the slotted elements (which still live in light DOM, just under a flex parent now).

Spacing throughout uses the `--atp-space-*` design tokens from [vendor/atp-web/atpco-atp-web-0.17.0.tgz](vendor/atp-web/atpco-atp-web-0.17.0.tgz) (`package/lib/styles/_variables-auto.css`), loaded automatically via the design system's `global.css`.

### 11. API integration: GET on mount, POST on submit

**File:** [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx)

Two helper functions at the bottom of the file own all network I/O:

- **`fetchExistingData()`** — `GET /api/three-v-deliveries` on mount. The response's `data` array is sorted in place by `acceptedAt` ascending (oldest → most recent) per the README requirement, then stored in `configData` state. A separate `useEffect` watches `configData` and `console.log`s the array so it shows up in the devtools as an expandable array literal.
- **`postDeliveryConfiguration(payload, forceError)`** — `POST /api/three-v-deliveries`. When `forceError` is true, appends `?error=true` to the URL so the test endpoint returns a 500. On non-2xx responses, reads the server's actual error shape (`responseData.errors` array joined with `'; '`, falling back to `responseData.message`, then `response.statusText`) and throws — the caller receives `{success: false, error}` and the alert displays the real server detail rather than a generic message.

Both helpers return a discriminated `{success, ...}` shape so the call sites read as simple branching on `.success` instead of try/catch.

The `forceError` flag is derived inside `handleSubmit` from `window.location.search` — loading the page at `?error=true` (e.g. `/delivery-configuration/create?error=true`) is enough to flip every subsequent POST into the error path, with no UI toggle to add and no React state to thread through.

### 12. Payload shape: matching the server's mixed casing

**Files:** [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx), [apps/tech-assessment-api/schema.md](apps/tech-assessment-api/schema.md)

The server validator at [apps/tech-assessment-api/server.mjs](apps/tech-assessment-api/server.mjs) (line 4) uses camelCase for almost every field but switches to snake_case for two:

- `last_file_suffix` (optional, always)
- `upload_option` (required when `deliveryLocation !== 'email'`)

The payload object built in `handleSubmit` quotes those two keys to preserve the snake_case while everything else uses shorthand camelCase identifiers. `maximumFileSize` is wrapped in `Number(...)` because the underlying `<input type="number">` still produces a string in React; the server rejects it as a string. The email branch uses `recipients` (plural) per the schema, even though the local state variable is `recipient` (singular).

### 13. Field-level validation with the design system's `isError` pattern

**Files:** [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx), [apps/tech-assessment-react/app/custom-elements.d.ts](apps/tech-assessment-react/app/custom-elements.d.ts)

The cron, last-file-suffix, delivery-file-name, and recipient-email fields each have a boolean validity flag in state (`isCronValid`, etc.) wired to the `isError` property on `<atp-input>`. Setting `isError={true}` triggers two design-system style rules inside the input's shadow DOM:

- `.field-wrapper.error:not(.disabled) .input-wrapper { border-color: var(--atp-red-600); }`
- `.field-wrapper.error:not(.disabled) .help-text { color: var(--atp-red-600); }`

The slotted `<span slot="help-text">` lives in light DOM but inherits `color` through the flattened tree from the shadow-DOM `<slot class="help-text">`, so its text turns red automatically when the field is invalid — no custom CSS module class needed.

To make TypeScript accept `isError` on the JSX element, [custom-elements.d.ts](apps/tech-assessment-react/app/custom-elements.d.ts) was extended with a per-tag prop interface (`{ isError?: boolean }`) layered on top of the existing `DetailedHTMLProps<...>` typing. The same pattern was used to add typings for `<atp-alert>` (`label`, `appearance`, `color`, `hasClose`), `<atp-checkbox>` (`label`, `name`, `value`), and `<atp-button>` (`label`).

Validation runs `onBlur` (see section 9) — `handleSubmit` re-runs the same `validateInput` helper for each field before posting and short-circuits with the appropriate flag set if any check fails.

### 14. Submission feedback: shared `<atp-alert>` for success and error

**File:** [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx)

A single `<atp-alert>` instance handles both outcomes:

- `color="danger"` + the server error string when `isServerError` is true
- `color="info"` + a generic success label when `isSuccess` is true
- `appearance="toast"` so it floats above the form rather than displacing layout
- `hasClose` to render the X button

The Lift alert dispatches a `closeEventOutput` custom event when the user clicks X but does **not** unmount itself — the consumer must clear the state. That's wired through a `useCallback` callback ref (`alertRef`) which registers a single `closeEventOutput` listener that clears all three flags (`isServerError`, `serverError`, `isSuccess`) and returns a cleanup function so React removes the listener when the element unmounts.

On successful POST, `handleSubmit` calls `resetForm()` — a `useCallback` that flips all 18 controlled-field setters back to their initial values — so the user can submit a second configuration without manually clearing every field.

### 15. Test suite fix

**File:** [apps/tech-assessment-react/tests/routes/_index.spec.tsx](apps/tech-assessment-react/tests/routes/_index.spec.tsx)

The starter shipped a single vitest test that asserts the string `'Hello there,'` appears on the root route. That text doesn't exist anywhere in the starter's `welcome.tsx` (which renders `'Welcome to the APTCO AI Starter for React!'`), so the test fails on a clean clone — independent of any assessment work.

Updated the assertion to match the actual rendered text. `npx nx test tech-assessment-react` now passes (1/1).

## Build + test status

- `npx nx build tech-assessment-react` — succeeds with no errors
- `npx nx test tech-assessment-react` — 1/1 passing
- TypeScript: no errors in the route file or any touched file

## How to verify the assessment requirements

1. **Route exists at `/delivery-configuration/create`** — load it in the browser; the form renders.
2. **Lift components used throughout** — every input, button, checkbox, card, alert, header, sidebar, and breadcrumb is an `<atp-*>` element.
3. **POST with success indicator** — fill in valid values, submit; a blue info `atp-alert` toast appears and the form resets.
4. **POST with error indicator** — load the page at `/delivery-configuration/create?error=true` and submit valid data; a red danger toast appears with the server's `"Internal server error"` message.
5. **GET on mount, sorted oldest → newest** — open devtools console on page load; the existing records array is logged (sorted by `acceptedAt` ascending).

