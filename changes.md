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
