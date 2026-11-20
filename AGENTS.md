# AGENTS.md — Feature-Based Next.js Architecture

## 1. Project Purpose

Build and maintain a secure, scalable, production-ready Next.js application using feature-based architecture.

All AI coding agents must follow this document when creating, modifying, refactoring, or reviewing code.

The primary architectural rule is:

**Organize the application by business feature. All functionality belonging to the same feature must be grouped inside that feature's directory.**

Examples:

- Login, signup, forgot password, and reset password belong to `features/auth/`.

- Dashboard widgets, statistics, and dashboard-specific API operations belong to `features/dashboard/`.

- User profile viewing and editing belong to `features/profile/`.

- Theme and language settings belong to `features/settings/` when they represent user-facing settings functionality.

- Generic buttons, inputs, dialogs, and reusable layout components belong to `components/`.

Do not scatter related functionality across unrelated directories.

---

## 2. Mandatory Architecture Rules

1. Use the Next.js App Router.

2. Use TypeScript for new application code.

3. Organize business functionality under `src/features/`.

4. Keep route definitions and page composition under `src/app/`.

5. Keep feature-specific components, services, schemas, types, hooks, and utilities inside the owning feature.

6. Keep genuinely reusable UI components under `src/components/`.

7. Keep shared infrastructure under `src/lib/`.

8. Keep application-wide providers under `src/providers/`.

9. Keep global internationalization configuration under `src/i18n/`.

10. Keep globally shared domain types under `src/types/`.

11. Follow existing project conventions and dependencies.

12. Prefer Server Components unless client-side functionality is required.

13. Keep server-only code and secrets out of browser bundles.

14. Preserve existing API contracts and application behavior.

15. Do not create unnecessary folders, files, abstractions, or dependencies.

16. Validate changes with appropriate tests and build checks.

17. Never claim that checks passed unless they were actually executed.

Before implementing a change, inspect the existing codebase and Git status.

Do not overwrite unrelated user changes.

---

## 3. Standard Project Structure

Follow this structure when appropriate for the project size:

my-nextjs-app/

├── AGENTS.md

├── public/

├── src/

│   ├── app/                          # Routes only

│   │   ├── (auth)/

│   │   │   ├── login/

│   │   │   │   └── page.tsx

│   │   │   ├── signup/

│   │   │   │   └── page.tsx

│   │   │   ├── forgot-password/

│   │   │   │   └── page.tsx

│   │   │   ├── reset-password/

│   │   │   │   └── page.tsx

│   │   │   └── layout.tsx

│   │   │

│   │   ├── (dashboard)/

│   │   │   ├── dashboard/

│   │   │   │   └── page.tsx

│   │   │   └── layout.tsx

│   │   │

│   │   ├── layout.tsx

│   │   └── globals.css

│   │

│   ├── features/

│   │   ├── auth/                     # All authentication functionality

│   │   │   ├── components/

│   │   │   │   ├── LoginForm.tsx

│   │   │   │   ├── SignupForm.tsx

│   │   │   │   ├── ForgotPasswordForm.tsx

│   │   │   │   └── ResetPasswordForm.tsx

│   │   │   ├── services/

│   │   │   │   └── auth-api.ts

│   │   │   ├── schemas/

│   │   │   │   └── auth.schema.ts

│   │   │   ├── hooks/

│   │   │   ├── types/

│   │   │   │   └── auth.types.ts

│   │   │   └── utils/

│   │   │

│   │   ├── dashboard/

│   │   │   ├── components/

│   │   │   ├── services/

│   │   │   └── types/

│   │   │

│   │   ├── profile/

│   │   │   ├── components/

│   │   │   ├── services/

│   │   │   └── types/

│   │   │

│   │   └── settings/

│   │       ├── components/

│   │       ├── services/

│   │       └── types/

│   │

│   ├── components/                   # Shared components

│   │   ├── ui/

│   │   │   ├── Button.tsx

│   │   │   └── Input.tsx

│   │   └── layout/

│   │

│   ├── lib/                          # Shared infrastructure

│   │   ├── api/

│   │   │   ├── client.ts

│   │   │   └── api-error.ts

│   │   ├── config/

│   │   └── utils/

│   │

│   ├── providers/

│   │   ├── ThemeProvider.tsx

│   │   └── AppProviders.tsx

│   │

│   ├── i18n/

│   │   └── dictionaries/

│   │       ├── en.json

│   │       └── si.json

│   │

│   └── types/

│

├── tests/

├── .env.example

├── package.json

├── tsconfig.json

└── next.config.ts

The structure is a guideline. Create directories only when required.

Do not create empty folders merely to match this example.

---

## 4. Feature Ownership Rules

### 4.1 Authentication Feature

All authentication-related business functionality must belong to:

`src/features/auth/`

This includes:

- Login

- Signup or registration

- Forgot password

- Reset password

- Email verification

- Authentication-related validation

- Authentication API integration

- Authentication-specific types

- Authentication-specific hooks

- Logout functionality

- Authentication-specific error handling

Example:

features/auth/

  components/

    LoginForm.tsx

    SignupForm.tsx

    ForgotPasswordForm.tsx

    ResetPasswordForm.tsx

    EmailVerificationForm.tsx

    LogoutButton.tsx

  services/

    auth-api.ts

  schemas/

    auth.schema.ts

  types/

    auth.types.ts

  hooks/

    use-auth.ts

  utils/

Do not create separate top-level features for login, signup, or forgot password. These are sub-capabilities of authentication, not independent business features.

### 4.2 Dashboard Feature

All dashboard-specific functionality must belong to:

`src/features/dashboard/`

Examples:

- Dashboard statistics

- Summary cards

- Recent activity

- Dashboard filters

- Dashboard-specific API operations

- Dashboard-specific types

Do not place dashboard business components in the global shared component directory.

### 4.3 Profile Feature

All profile-specific functionality must belong to:

`src/features/profile/`

Examples:

- View profile

- Edit profile

- Update personal details

- Upload a profile image

- Profile validation

- Profile API integration

### 4.4 Settings Feature

All user-facing settings functionality must belong to:

`src/features/settings/`

Examples:

- Update account preferences

- Manage notification preferences

- Update application-specific settings

- Validate settings forms

- Communicate with settings APIs

Theme and language controls may be shared UI components, but user-specific preference workflows belong to the appropriate feature.

### 4.5 Adding New Features

When adding a new business capability:

1. Determine whether it belongs to an existing feature.

2. If it belongs to an existing feature, extend that feature.

3. If it is a distinct business capability, create a new feature directory.

4. Place its components, services, schemas, and types inside that feature.

5. Add route files under `src/app/` as needed.

6. Reuse shared components and infrastructure where appropriate.

7. Update tests and documentation.

Do not create a new feature for every page or button.

---

## 5. Routing Rules

The `src/app/` directory is responsible for Next.js routing.

Page files should remain small and primarily compose feature components.

For example:

`src/app/(auth)/login/page.tsx`

should render the login page using:

`src/features/auth/components/LoginForm.tsx`

Similarly:

- `/signup` uses the signup functionality in `features/auth/`.

- `/forgot-password` uses the forgot-password functionality in `features/auth/`.

- `/dashboard` uses the dashboard functionality in `features/dashboard/`.

- `/profile` uses the profile functionality in `features/profile/`.

Route groups such as `(auth)` and `(dashboard)` are organizational folders and do not appear in URLs.

Use layouts to share page structure where appropriate.

Do not put substantial business logic directly inside `page.tsx` files.

Protect private routes through server-side authentication and authorization. A route group or redirect alone does not secure a route.

---

## 6. Feature Component Rules

Components that are specific to one feature must stay inside that feature.

Examples:

- `LoginForm.tsx` belongs in `features/auth/components/`.

- `SignupForm.tsx` belongs in `features/auth/components/`.

- `DashboardStats.tsx` belongs in `features/dashboard/components/`.

- `ProfileForm.tsx` belongs in `features/profile/components/`.

Shared components belong in:

`src/components/`

Examples:

- Button

- Input

- Card

- Dialog

- Modal

- Spinner

- Generic form field

- Shared page header

Before creating a new component, check whether a suitable shared component already exists.

Do not duplicate reusable UI implementations.

Do not move business-specific components into shared folders merely because they are used by multiple files in the same feature.

---

## 7. API Service Rules

Keep feature-specific API operations inside the corresponding feature.

Examples:

- `features/auth/services/auth-api.ts`

- `features/dashboard/services/dashboard-api.ts`

- `features/profile/services/profile-api.ts`

- `features/settings/services/settings-api.ts`

Shared HTTP infrastructure belongs in:

`src/lib/api/`

For example:

- `client.ts`

- `server.ts`

- `api-error.ts`

Feature services must use the shared API infrastructure where appropriate.

Do not place all application endpoints in one large global API service.

Do not create a separate HTTP client for every feature unless different technical requirements justify it.

### Existing Backend Integration

When integrating with an existing backend:

1. Read the Swagger/OpenAPI documentation.

2. Confirm the endpoint and HTTP method.

3. Confirm request and response schemas.

4. Confirm authentication requirements and headers.

5. Implement the service inside the relevant feature.

6. Handle loading, success, validation, and error states.

7. Preserve existing API response formats.

8. Test successful and unsuccessful requests.

Do not invent endpoints, response fields, or authentication mechanisms when documentation is available.

---

## 8. Authentication and Security

Authentication functionality belongs to `features/auth/`, while shared server-side session infrastructure may belong to `lib/auth/`.

Follow the existing backend authentication contract.

Requirements:

- Validate login and signup input.

- Never log passwords or authentication tokens.

- Never store plaintext passwords.

- Do not expose private API keys to client-side code.

- Avoid storing sensitive tokens in localStorage or sessionStorage.

- Use an appropriate secure session strategy.

- Use appropriately configured HttpOnly, Secure, and SameSite cookies when compatible with the authentication architecture.

- Verify sessions on the server.

- Enforce authorization at protected data and operation boundaries.

- Handle logout and session expiration correctly.

- Do not trust client-supplied roles or user identifiers without server-side verification.

- Do not expose internal stack traces or sensitive backend details.

Validate untrusted input on the server. Client-side validation is for user experience and does not replace server-side validation.

Do not invent token-refresh or cookie behavior that the backend does not support.

---

## 9. Server and Client Component Rules

Server Components are the default.

Use Client Components only when needed for:

- React state and event handlers

- Browser APIs

- Interactive forms

- Effects and subscriptions

- Client-side UI state

Keep client boundaries as small as practical.

Do not convert an entire page into a Client Component because one child requires interactivity.

Keep server-only modules separate from browser-safe modules.

Do not import private server configuration or session utilities into Client Components.

Use Route Handlers or Server Actions when appropriate, and validate and authorize every sensitive operation independently.

Follow the conventions of the installed Next.js version.

---

## 10. TypeScript and Validation

Use TypeScript with strict checking.

Requirements:

- Define types for feature-specific domain data.

- Define request and response types for API operations.

- Avoid `any`.

- Prefer `unknown` for untrusted values.

- Avoid unnecessary type assertions.

- Represent nullable and optional fields accurately.

- Validate incoming data at runtime where required.

- Use Zod or an existing validation library where appropriate.

Keep feature-specific types and schemas inside their feature.

For example:

`src/features/auth/types/auth.types.ts`

`src/features/auth/schemas/auth.schema.ts`

Keep only genuinely shared types in `src/types/`.

---

## 11. Feature Dependency Rules

Maintain clear boundaries between features.

- A feature may use shared UI and shared infrastructure.

- A feature should not depend on another feature's private implementation details.

- Shared infrastructure must not import business features.

- Avoid circular dependencies.

- Use public feature entry points when cross-feature access is necessary.

- Do not expose server-only functionality through client-accessible exports.

- Keep feature-specific logic inside its owning feature.

If two features need the same business capability, identify the correct owner or introduce a shared domain module only when justified.

Do not duplicate the same business rules across features.

---

## 12. Themes and Internationalization

Use a consistent application-wide strategy for light mode and dark mode.

Keep theme providers in `src/providers/` and generic theme controls in `src/components/` where appropriate.

Requirements:

- Support the required themes consistently.

- Respect system preferences where appropriate.

- Avoid theme-related hydration mismatches.

- Ensure all components work in both themes.

For multilingual support:

- Keep global internationalization configuration in `src/i18n/`.

- Store translations in the configured dictionary or resource structure.

- Avoid scattering hardcoded interface text throughout features.

- Use consistent translation keys.

- Provide appropriate fallback behavior.

- Format dates, numbers, and currencies according to locale.

Use an appropriate internationalization library when required by the application's routing and translation needs.

---

## 19. Responsive Design and Mobile-First Development

All user-facing pages and components must be responsive and usable across mobile phones, tablets, laptops, and desktop screens.

Requirements:
1. Use a mobile-first approach: implement the base layout for small screens, then progressively enhance it with responsive breakpoints.
2. Use the project's existing Tailwind CSS breakpoints and design conventions. Do not introduce arbitrary breakpoints without a clear need.
3. Prevent horizontal page overflow at all supported viewport widths. Do not solve overflow by hiding important content.
4. Adapt layouts appropriately: stack columns on narrow screens, use suitable grid column counts, and adjust spacing, padding, typography, and component sizes.
5. Make navigation usable on mobile. Use an appropriate collapsible menu or drawer when the desktop navigation cannot fit; ensure it can be opened, closed, and navigated with touch and keyboard.
6. Ensure forms and inputs fit the viewport, have readable labels, usable validation messages, and touch-friendly controls.
7. Make tables usable on small screens. Prefer a responsive card/list presentation or a clearly contained horizontal scroll region when preserving a table is necessary. Keep key information accessible and do not cause page-level horizontal scrolling.
8. Ensure cards, dialogs, dropdowns, popovers, charts, maps, and data visualizations resize or adapt to the available space. Dialogs must fit within the viewport and remain scrollable when their content is tall.
9. Use responsive images and media. Prevent distortion, clipping of important content, and layout shifts; use appropriate sizing and aspect ratios.
10. Maintain readable contrast, font sizes, spacing, and clear visual hierarchy at every breakpoint. Do not rely on hover-only interactions on touch devices.
11. Support keyboard navigation and visible focus states. Interactive targets should be comfortably usable on touch screens.
12. Preserve the application's visual design, functionality, accessibility, and light/dark theme behavior across screen sizes.
13. Do not create a separate mobile implementation unless the interaction genuinely requires it. Prefer one maintainable responsive component.
14. Do not assume a page is responsive because it uses Tailwind CSS. Verify the actual rendered layout at representative viewport widths.
Before completing UI work, check at minimum:
- Small mobile: 320–375px wide.
- Large mobile: approximately 390–430px wide.
- Tablet: approximately 768px wide.
- Laptop/desktop: 1024px and wider.
Check for clipped content, overlapping elements, unreadable text, inaccessible controls, broken navigation, and unintended horizontal scrolling. Fix issues introduced by the change before reporting completion.
## 19. Testing Standards

Place tests according to the established project conventions.

Test important behavior for each feature.

Authentication tests should cover:

- Login success and failure

- Signup validation

- Password-reset behavior

- Authentication error handling

- Session and logout behavior

- Unauthorized access

Dashboard tests should cover relevant data loading, empty states, and errors.

Profile tests should cover data validation and updates.

Settings tests should cover preference changes and persistence where applicable.

Use unit, integration, and end-to-end tests according to the feature's complexity and risk.

Run the relevant tests after making changes.

Never claim that tests passed without executing them.

---

## 19. Code Quality and Naming

Follow consistent naming conventions.

- Components: PascalCase

- Functions and variables: camelCase

- Custom hooks: `use` prefix

- Types and interfaces: PascalCase

- Feature service files: descriptive kebab-case

- Validation schemas: descriptive kebab-case

Examples:

- `LoginForm.tsx`

- `auth-api.ts`

- `auth.schema.ts`

- `auth.types.ts`

- `use-auth.ts`

Write readable, focused functions.

Avoid duplicated logic, unexplained magic values, unnecessary abstractions, and deeply nested conditions where simpler alternatives are available.

Follow existing linting and formatting conventions.

Do not refactor unrelated files during a narrowly scoped change unless necessary.

---

## 19. Environment Configuration

Use environment variables for environment-specific configuration.

Document required variable names in `.env.example` with safe placeholder values.

Never commit real credentials.

Never expose private values using `NEXT_PUBLIC_`.

Validate required configuration at the appropriate initialization boundary.

Follow the existing environment variable names and deployment conventions.

---

## 19. Development Workflow

Before implementing a feature:

1. Read this `AGENTS.md`.

2. Inspect the existing folder structure.

3. Review the relevant feature and shared components.

4. Check the Git status.

5. Read the relevant API documentation.

6. Identify the correct feature owner.

7. Plan the smallest complete change.

After implementing:

1. Review the changes.

2. Check that files are in the correct feature directories.

3. Check for duplicated components or business logic.

4. Verify security and API contract requirements.

5. Run relevant tests.

6. Run linting and TypeScript checks.

7. Run a production build when appropriate.

8. Report the results and remaining issues.

Preserve existing user changes. Do not commit or push unless authorized.

---

## 19. Required Final Response

After completing a task, report:

### Changes Made

Summarize the functionality implemented.

### Files Changed

List important files and their purposes.

### Feature Organization

Explain which feature owns the new functionality and why.

### API Changes

State whether endpoints or response contracts changed.

### Validation

List the commands actually executed and their results.

### Remaining Work

Identify unresolved issues and unverified requirements.

Never claim that a feature is production-ready solely because code has been written.

---

## 19. Final Principle

**Group related functionality by business feature.**

For example, login, signup, forgot password, reset password, email verification, and logout belong to `features/auth/`.

Keep `app/` responsible for routing, `components/` responsible for genuinely shared UI, and `lib/` responsible for shared infrastructure.

Follow these boundaries consistently while preserving existing functionality, security, and maintainability.