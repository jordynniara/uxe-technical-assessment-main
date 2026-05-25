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
