# UXE Technical Assessment — React Solution

Implementation of the Create Delivery Configuration form in the React starter, using `@atpco/atp-web@0.17.0`. Full change log: [changes.md](changes.md).

## Run

```sh
npm install
npm run dev:tech-assessment-react-mode
```

Open <http://localhost:4200/delivery-configuration/create>.

## Build & test

```sh
npx nx build tech-assessment-react   # clean build
npx nx test tech-assessment-react    # 1/1 passing
```

## What's implemented

- **Route** at `/delivery-configuration/create` — [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx).
- **Form** covering every field in [apps/tech-assessment-api/schema.md](apps/tech-assessment-api/schema.md), built entirely from Lift Design System web components (`atp-input`, `atp-dropdown`, `atp-checkbox`, `atp-card`, `atp-button`, `atp-alert`, `atp-header`, `atp-sidebar`, `atp-breadcrumbs`).
- **Conditional sections** — the location-details card swaps between email and cloud fields based on the delivery-location dropdown; the combine-files card appears when that checkbox is on.
- **Validation** — on-blur format checks for cron, file-safe names, and email (single or comma-separated). The design-system `isError` property handles the red border + help-text styling; required-field check runs at submit time via a shared callback ref.
- **POST** with success/error feedback via a single shared `<atp-alert>` (toast appearance, color swapped on outcome, close button). Form resets on success.
- **GET** on mount logs the existing configs array (sorted by `acceptedAt` ascending) to the devtools console.
- **Forced-error mode** — load the route at `?error=true`; the POST is sent with the same query string and the server returns 500.

## Notable implementation details

- Wrapper components (`AtpDropdownField`, `AtpCheckbox`) isolate the Lit web-component interop (imperative property setters + `xxxEventOutput` events) so the form JSX reads as plain controlled-component React.
- `custom-elements.d.ts` augments React 19's JSX namespace correctly (module augmentation, not the global pattern the starter shipped with — which silently did nothing on `@types/react` v19).
- Payload preserves the schema's mixed casing — `last_file_suffix` and `upload_option` stay snake_case on the wire while local state stays camelCase.

## Design call-outs

| Decision | Reason |
|---|---|
| One shared `<atp-alert>` for success + error | Single mount point, single close listener, simpler state. |
| Validate on blur, not on change | Blocking invalid intermediate values made controlled inputs un-typeable. |
| `?error=true` read from `window.location.search` | Matches the assignment phrasing; no extra UI control needed. |
| Comma-separated recipients | API field is plural (`recipients: string`); single-address restriction felt inconsistent with the schema. |
| Accessibility delegated to design system | `isError` toggles `aria-invalid`, labels use slotted `<label>` — no custom ARIA layered on top. A real audit would still check keyboard order across conditional cards, `aria-live` on the alert, and contrast of `--atp-red-600`. |

See [changes.md](changes.md) for the full list of assumptions and a per-change rationale.

## Files of interest

- [apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx](apps/tech-assessment-react/app/routes/delivery-configuration-create.tsx) — main route + wrappers + API helpers
- [apps/tech-assessment-react/app/custom-elements.d.ts](apps/tech-assessment-react/app/custom-elements.d.ts) — JSX typings for `<atp-*>` elements
- [apps/tech-assessment-react/app/app.module.css](apps/tech-assessment-react/app/app.module.css) — form layout
- [changes.md](changes.md) — full change log

---

## Original assessment brief

Lift Design System docs: <http://d2vz07p3m3c4xg.cloudfront.net/>. Recommended Node: `v22.14.0`.

The local API at [apps/tech-assessment-api/server.mjs](apps/tech-assessment-api/server.mjs) exposes:

- `GET /api/three-v-deliveries`
- `POST /api/three-v-deliveries` (append `?error=true` to force a 500)

Dev server proxies `/api/*` to `http://localhost:3333` via [apps/tech-assessment-react/vite.config.mts](apps/tech-assessment-react/vite.config.mts).

Sample POST:

```sh
curl -X POST http://localhost:3333/api/three-v-deliveries \
  -H "Content-Type: application/json" \
  --data @apps/tech-assessment-api/sample-payload.json
```

Payload schema: [apps/tech-assessment-api/schema.md](apps/tech-assessment-api/schema.md).
