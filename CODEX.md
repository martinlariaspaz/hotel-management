# CODEX.md

Coding guidelines for this repository. These rules apply especially to the UI app in `ui/`.

## BE

### Socket

- Use Socket for realtime connections.

## UI

The UI should grow around a feature-based architecture instead of organizing all logic by screen. Pages compose sections, and sections consume features.

### UI Stack

- Use React as the UI framework.
- Use Mantine for UI components, styling primitives, and editors.
- Use React Hook Form for every form.
- Use React Router for application routing.
- Prefer established library APIs over custom infrastructure when Mantine, React Hook Form, or React Router already solve the problem cleanly.

### Internationalization

- Every user-facing phrase must be added through i18n. Do not hardcode visible UI copy directly in components, hooks, pages, or feature modules.
- i18n files must be structured by page sections so translations are easy to read, maintain, and implement.
- Translation keys should describe the page, section, and intent of the phrase rather than mirroring the literal text.
- Spelling, grammar, accents, and punctuation must be impeccable in every supported language.
- For now, the application must support English and Argentine Spanish.
- English copy should use clear product language. Argentine Spanish copy should use natural `es-AR` phrasing.

### Responsive Design

- The UI must be responsive across laptop, desktop monitor, tablet, and mobile phone viewports.
- Layouts should adapt intentionally at each size instead of only shrinking desktop UI.
- Avoid horizontal scrolling on normal content screens.
- Forms, tables, navigation, modals, and action areas must remain usable on mobile.
- Use Mantine responsive APIs, CSS grid, flexbox, and well-defined breakpoints when they make the layout clearer.
- Verify important screens at representative desktop, tablet, and mobile widths before considering them complete.

### Dark Mode

- The UI must support dark mode.
- Use Mantine color scheme primitives and theme tokens instead of hardcoded colors whenever possible.
- New components must be checked in both light and dark modes.
- Avoid styling that only works against one background color.
- Persist the user's color scheme preference when the application supports toggling it.

Expected structure:

```txt
ui/src/
  pages/
    Page1/
      Section1/
      Section2/
      Section3/
    Page2/
      Section1/
      Section2/
      Section3/
  features/
    feature-name/
      business/
      utils/
      hooks/
      components/
        common/
      repositories/
      types/
```

### Pages and Sections

- `pages/` contains all application pages and their sections.
- A page should orchestrate sections, layout, and high-level navigation.
- A section should solve one concrete part of a page without concentrating complex business rules.
- Pages and sections may import components, hooks, and types from features, but they should not duplicate business logic.
- If a section starts accumulating reusable rules, move those rules to `features/<feature>/business`.

### Features

Each feature should group code by functional domain. Examples: `rooms`, `reservations`, `guests`, `billing`, `auth`.

#### `business/`

- Contains pure business rules or rules that are as decoupled as possible from external libraries.
- Must be highly testable and should avoid dependencies on React, Zustand, React Query, Socket.IO, or browser APIs.
- Every file inside `business/` must have Jest tests.
- Functions should receive data through parameters and return explicit results.
- Avoid side effects. If a rule needs I/O, separate the pure calculation from the external access.

#### `utils/`

- Contains feature-level helper utilities.
- Utilities may remain untested when they are trivial or purely presentational.
- If a utility is used by `business/`, it must have Jest tests.
- Do not turn `utils/` into a generic dumping ground. If something is shared across many features, move it to an agreed common location.

#### `hooks/`

- Contains feature-specific hooks.
- Test hooks when they contain meaningful logic, state coordination, effects, or non-trivial transformations.
- Always keep this internal order:
  1. Calls to other hooks.
  2. Variable extraction and derived values.
  3. Functions and callbacks.
  4. `useEffect` and other effects.
  5. `return` at the end.
- Hooks should not hide complex business rules. That logic belongs in `business/`.
- Hooks may coordinate React Query, Zustand, repositories, sockets, and UI state.

#### `components/`

- Contains components owned by the feature.
- Components should focus on UI, interaction, and composition.
- Avoid complex business rules inside components.
- Component props should live next to the component, not in `types/`, unless they represent a reusable domain entity.
- `components/common/` may contain reusable components within the feature, base components, reusable styles, or visual pieces shared by multiple components in that feature.

#### Forms

- Every form controller should have placeholder.
- Controller placeholders must follow the field type convention, except date components, whose placeholder must show the expected date format.
- Dropdown and select placeholders must start with `Seleccione un`.
- Text input placeholders must start with `Ingrese un`.
- Every form must be strictly typed.
- Every form must be driven by metadata so labels, placeholders, input types, validations, default behavior, and layout can be changed without rewriting the form component.
- Form metadata must define, at minimum, each controller's name, label, placeholder, type, and validations.
- Validations must support synchronous and asynchronous rules.
- Validations must be type-aware. For example, text, number, date, select, checkbox, and custom controllers should each be able to declare validations that match their value type and UI behavior.
- Metadata should be easy to extend with feature-specific options without changing the generic renderer for every new field.
- When form metadata is represented as a double array, treat it as a layout matrix: the outer array defines rows and the inner array defines controller positions inside that row.
- For example, metadata shaped as `[2][3]` means two rows with three controllers per row.
- Form value types should be explicit and live close to the form unless they represent reusable domain input.
- Use React Hook Form as the form state library for concrete application forms.
- Keep validation schemas, submit payload mapping, and business rules separated from presentational components.
- Avoid components with excessive prop lists. When a form has shared stable data or callbacks, prefer a native React context scoped to that form.
- Form context values must be designed carefully to avoid unnecessary rerenders. Split contexts or memoize values when different parts of the form update at different frequencies.
- Do not wrap a large screen in a form context if updates inside that context will rerender unrelated UI.
- Pass values by props when they are local, simple, or frequently changing and context would make rendering behavior harder to reason about.
- If generic form components or controllers are created, they must be form-library agnostic. They should not depend directly on React Hook Form types, controllers, or field state.
- Generic form components and controllers must work reliably and have tests that cover their expected behavior.

#### `repositories/`

- Contains repositories needed to access external data.
- Repositories should expose clear contracts and hide HTTP, storage, socket, or mock details.
- Avoid importing concrete repositories directly from components. Prefer consuming them through context or feature hooks.
- Repositories must be replaceable in tests.

#### `types/`

- Contains domain entities that are not related to props, internal function parameters, or hook details.
- Valid example: `Room.ts`, `Reservation.ts`, `Guest.ts`.
- Invalid example: `RoomCardProps`, `UseRoomsOptions`, `CreateRoomFormProps`. Those types should live next to the component, hook, or function that consumes them.

### Exports and Folder Indexes

- Every file that declares a function, component, hook, variable, constant, or type must expose its main module API as a default export.
- Each folder must include an `index.ts` file.
- Folder `index.ts` files must re-export the module with an explicit public name.
- Consumers should import from folder indexes instead of deep internal files when possible.
- Keep each module focused enough that a default export is unambiguous.

Examples:

```ts
// features/auth/components/LoginForm/LoginForm.tsx
function LoginForm() {
  return null;
}

export default LoginForm;
```

```ts
// features/auth/components/LoginForm/index.ts
export { default as LoginForm } from "./LoginForm";
```

```ts
// features/auth/types/AuthSession.ts
type AuthSession = {
  token: string;
  expiresAt: string;
};

export type { AuthSession as default };
```

```ts
// features/auth/types/index.ts
export type { default as AuthSession } from "./AuthSession";
```

## Repositories and Injection

- The application must have a repository context that wraps the UI.
- That context must allow implementations to be swapped by environment: production, development, tests, and mocks.
- Tests must not depend on real repositories or external services.
- Hooks and features should consume repositories through context or testable adapters.
- Avoid rigid global singletons for data access.

## State

### Zustand

- Use Zustand for shared client state.
- Create slices by feature, not by screen.
- A slice should represent state and actions for a feature domain.
- Avoid letting a slice know about specific components or sections.
- Keep selectors small to reduce unnecessary renders.

### React Query

- Use React Query for external store management: server state, cache, synchronization, invalidation, and remote loading/error states.
- Do not duplicate state in Zustand when it is already correctly modeled in React Query.
- Query keys must be stable, descriptive, and preferably defined by feature.
- Mutations must explicitly invalidate or update cache.

### Socket.IO

- Use Socket.IO for realtime connections.
- Encapsulate the connection in a dedicated provider, service, or hook.
- Do not open Socket.IO connections directly from scattered components.
- Incoming events must explicitly update React Query, Zustand, or feature handlers.
- Clean up listeners and connections when appropriate to avoid leaks.

## Testing

- Jest is mandatory for every file inside `business/`.
- Jest is also mandatory for any utility used by `business/`.
- Prioritize tests for pure rules over fragile implementation tests.
- Mock repositories through the repository context.
- Tests should cover happy paths, relevant edge cases, and expected errors.

## Implementation Conventions

- Prefer strict TypeScript and clear domain types.
- Avoid circular dependencies between features.
- Avoid deep imports into internal folders of other features. Expose clear APIs when one feature must be consumed by another.
- Keep components small and composable.
- Keep side effects out of `business/`.
- Name files and folders after domain intent, not accidental UI details.
- Before adding an abstraction, verify that it reduces real complexity or meaningful duplication.

## UI Change Checklist

- The page only orchestrates sections and general flow.
- Business rules live in `features/<feature>/business`.
- Every new `business/` file has Jest tests.
- Utilities used by `business/` have Jest tests.
- Hooks follow the required internal order.
- Repositories are consumed through context or replaceable adapters.
- Zustand is organized by feature.
- React Query manages remote state and cache.
- Socket.IO is encapsulated and cleans up listeners.
- Props live next to components, hooks, or functions, not in `types/`.
