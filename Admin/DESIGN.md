---
name: PlanAmWell Admin Design System
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5b4043'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8f6f73'
  outline-variant: '#e3bdc2'
  surface-tint: '#bc004a'
  primary: '#b10045'
  on-primary: '#ffffff'
  primary-container: '#d81e5b'
  on-primary-container: '#fff3f3'
  inverse-primary: '#ffb2bd'
  secondary: '#835500'
  on-secondary: '#ffffff'
  secondary-container: '#feae2c'
  on-secondary-container: '#6b4500'
  tertiary: '#0058a4'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b71cd'
  on-tertiary-container: '#f3f5ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9de'
  primary-fixed-dim: '#ffb2bd'
  on-primary-fixed: '#400014'
  on-primary-fixed-variant: '#900037'
  secondary-fixed: '#ffddb4'
  secondary-fixed-dim: '#ffb955'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#633f00'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#a5c8ff'
  on-tertiary-fixed: '#001c3a'
  on-tertiary-fixed-variant: '#004786'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg: { fontFamily: Inter, fontSize: 48px, fontWeight: '700', lineHeight: 56px, letterSpacing: -0.02em }
  headline-lg: { fontFamily: Inter, fontSize: 32px, fontWeight: '700', lineHeight: 40px, letterSpacing: -0.01em }
  headline-lg-mobile: { fontFamily: Inter, fontSize: 28px, fontWeight: '700', lineHeight: 36px }
  headline-md: { fontFamily: Inter, fontSize: 24px, fontWeight: '600', lineHeight: 32px }
  body-lg: { fontFamily: Inter, fontSize: 18px, fontWeight: '400', lineHeight: 28px }
  body-md: { fontFamily: Inter, fontSize: 16px, fontWeight: '400', lineHeight: 24px }
  label-md: { fontFamily: Inter, fontSize: 14px, fontWeight: '600', lineHeight: 20px, letterSpacing: 0.01em }
  label-sm: { fontFamily: Inter, fontSize: 12px, fontWeight: '500', lineHeight: 16px }
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
  card: 28px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  stack-xl: 64px
---

## Status

This is a **migration spec**, not an as-shipped record. The admin dashboard currently runs its own ad hoc light/dark `ThemeContext` and hand-rolled Tailwind (see [Divergences](#divergences-from-the-stitch-mockups-and-current-app) below) and is being brought onto the same "Empathetic Modernism" design system as `web/` (see `../../web/DESIGN.md`), using 20 Stitch-generated mockups as the visual reference. Screens are migrated **one at a time** — see [Migration status](#migration-status) for what's done.

## Design tokens

Same token set as `web/DESIGN.md`, confirmed identical across all 20 Stitch mockups (color hexes, radii, spacing, type scale never varied between screens). Stitch always renders its previews as standalone HTML with a Tailwind v3 `tailwind.config` CDN script — that is a preview-tool artifact, **not** the target implementation. This app is Tailwind v4, so tokens are implemented as CSS custom properties via `@theme inline` in `app/globals.css`, exactly like `web/src/app/globals.css` does. Do not add a `tailwind.config.*` file.

Two token names differ in meaning from the M3 defaults and should be pinned explicitly in `globals.css`:
- `--radius-card` = `28px` (Stitch mockups use both `rounded-xl` (`3rem`) *and* literal `rounded-[28px]`/`0_4px_20px` inline values inconsistently for cards — standardize on **28px + the soft shadow below**, matching `web/`'s `rounded-card`).
- `--shadow-atmospheric` = `0 4px 20px rgba(0,0,0,0.04)` — the soft diffused card shadow used everywhere in the mockups (`soft-shadow` / `glass-card` / `layer-1` / `floating-card` classes are all this same shadow under different ad hoc names per screen).

Buttons and inputs are pill-shaped (`rounded-full`), 56px tall, matching `web/`. Cards use `rounded-card` + `shadow-atmospheric`, no border (a few mockups add a hairline `border border-surface-variant` on top of the shadow — drop that, `web/`'s convention is shadow-only).

**Update:** the original call here was a single fixed light theme (matching `web/`). That's been reversed — Admin now ships a real, user-toggleable dark mode (`web/` still doesn't have one; that product's single-theme decision stands on its own). See **Dark mode** below for the mechanism. None of the mockups' `darkMode: "class"` / `dark:` variant scaffolding is used — dark mode here is driven entirely by redefining the same CSS custom properties, not Tailwind's dark variant.

## Dark mode

Every component reads color through the CSS custom properties defined in `app/globals.css` — never a raw Tailwind palette class (`bg-white`, `text-gray-600`) and never a `dark:` variant. That discipline is what makes dark mode close to free: redefine the tokens once, and every already-built screen picks it up automatically with zero per-component changes.

- **Token values**: `globals.css` defines the light palette on bare `:root`, then a dark palette twice — once under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])` (respects OS setting by default), and again under `:root[data-theme="dark"]` (so an explicit user choice wins in both directions). The M3-style token set already shipped with `-fixed`/`-fixed-dim` tone pairs for primary/secondary/tertiary (present since the original Stitch brief, unused while `web/` and this app were light-only) — those turned out to be exactly the correct dark-mode tones for the brand triad, so the dark palette reuses them rather than inventing new colors. Neutrals (surface tiers, outline, on-surface) and error use a standard M3 dark ramp.
- **Two tokens added that don't exist in the source brief**: `--color-success`/`--color-on-success`/`--color-success-container`/`--color-on-success-container` (Badge's "success" tone and `StatCard`'s positive-growth indicator used to be raw green hexes — not theme-aware, now first-class tokens), and `--color-chart-negative` (the Doctor Status donut's "Rejected" slice — dark mode's baseline `--color-error` pastel (`#ffb4ab`) sits too close to dark mode's `--color-primary` pastel (`#ffb2bd`) to tell the two chart segments apart, so this gets its own more saturated coral-red rather than overloading the alert/badge error token for a data-viz need it wasn't tuned for).
- **Toggle**: `app/components/theme/ThemeToggle.tsx`, a self-contained button in `AdminShell`'s topbar (sun/moon icon). Writes `data-theme` on `<html>` + `localStorage` directly — no React context, nothing else in the tree needs to read theme state. A small inline script in `app/layout.tsx`'s `<body>` applies a saved choice before paint (avoids a light-then-dark flash); `<html>` carries `suppressHydrationWarning` since that script intentionally makes the client DOM differ from the server-rendered markup.
- **Charts**: `GrowthBarChart`/`DoctorStatusChart` (recharts, SVG-based) use `var(--color-*)` strings directly for fills/grid/tooltip — SVG presentation attributes resolve CSS custom properties, so these react live with no JS involved. The one `chart.js` canvas (`advocacy/analytics/view`) *can't* do that — canvas needs a resolved color, not a var() reference — so it uses a new hook, `app/hooks/useCssVarColor.ts`, which resolves the variable via `getComputedStyle` and re-resolves on a `MutationObserver` watching `<html>`'s `data-theme` attribute (plus a `matchMedia` listener for OS-level changes).
- **Not yet dark-mode-aware**: `/auth/login` and `/auth/register` — still unmigrated (see Migration status), still on the old `ThemeContext`/ad hoc Tailwind, deliberately left alone here so as not to touch a screen out of scope. `ThemeToggle` only appears inside `AdminShell`, i.e. only on `/dashboard/**`.

## Divergences from the Stitch mockups (and current app)

The mockups were generated from a generic "telehealth back-office" brief and don't perfectly match this product. Deviate deliberately in these places:

| In the mockups | In this implementation | Why |
|---|---|---|
| Brand name "TeleCare Admin" (most screens) / "PlanAmWell Admin" (a few) | **"PlanAmWell Admin"**, consistently | Matches the real product; the mockups are inconsistent between screens |
| Sidebar nav: Dashboard, Patient Records, Provider Queue, Consultations, Pharmacy(/Logs), Analytics, System Settings | **Dashboard, Users, Doctors, Orders, Partners, Advocacy** | The mockup nav is generic hospital-admin filler invented by Stitch — it doesn't correspond to any route in this app. The real sitemap (see `app/dashboard/*`) is authoritative |
| Topbar secondary nav links: "Direct Reports", "Pharmacy Logs", "Audit Trail" | Dropped | Same reason — not real features/routes. Topbar carries search, notifications, profile only |
| "Panic Cloak" button, "Quick Exit"/"Emergency Close" button, pseudonym badges ("Ayo (Alpha)", "Dr. Ami"), "Unmarked Packaging Requested" dispatch notice | **Dropped entirely** | These are the consumer app's domestic-violence-discretion safety features (see `web/DESIGN.md`'s pseudonym system and `QuickExitButton`). This is an internal tool used by verified staff, not something anyone needs to hide from an abuser mid-session. Admin always shows real names (`User.name`), never pseudonyms |
| Card-grid list views (mockups model these as data tables already, but the *current* admin app still uses card grids for Users) | **Data tables** with sortable columns, filters, pagination, row actions | Matches every Stitch list-page mockup; also just correct for a data-dense back-office tool over a casual-browsing card grid |
| `darkMode: "class"` + `dark:` variants throughout | Dropped — dark mode is real (user-toggleable) but implemented via CSS custom-property redefinition, not Tailwind's dark variant | See **Dark mode** section |
| Placeholder headshot `<img>`s (Unsplash-style AI-generated portraits) for admin/user avatars | **`AvatarInitials`** (`app/components/ui/Table.tsx`): shows the real photo when the record has one, falls back to initials otherwise | **Correction, see below** — Users and Doctors *do* have real uploaded photos (`userImage`/`doctorImage`, populated by the admin API), this was wrongly assumed absent during the initial migration and silently dropped; fixed after the fact. Partners always rendered `partnerImage` correctly. |
| Doctor detail's MDCN registration / API verification / uploaded-document panel | Implement only as far as real fields exist in `AdminService`/backend; do not fabricate document-upload or MDCN-API-check UI unless the backend actually supports it | Don't build UI for a capability that doesn't exist server-side — verify per screen before implementing |

### Real avatar photos (bug fix)

Confirmed against the actual backend (`backend/src/models/user.ts`, `doctor.ts`, `image.ts`, and `adminController.ts`'s `getAllUsersAdmin`/`getAllDoctorsAdmin`/`getUserById`, which all `.populate()` the image ref): Users have `userImage` (populated `Image` doc, `.url` via a schema virtual), Doctors have *both* `doctorImage` (same pattern) and a plain-string `profileImage`. These are real, working fields returned by the admin API today — not something that needs backend work.

`AvatarInitials` takes an optional `src`; pass `u.userImage?.url` for users and `d.doctorImage?.url || d.profileImage` for doctors (that order — a doctor could in principle have either set) at every call site: Users list/detail, Doctors list/detail, and the Dashboard's `RecentUsers` (both the row list and the detail modal, which previously showed no photo at all even though the pre-migration code did). If the URL 404s (stale/deleted Cloudinary asset), `AvatarInitials` catches `onError` and falls back to initials rather than showing a broken-image icon.

## Component inventory (`app/components/ui/`, to be built)

Nothing here exists yet — the app currently hand-rolls Tailwind per page and has one legacy `app/components/ui/Card.tsx`. Building this library is the prerequisite "foundation" work before any screen migration, same approach `web/` took.

| Component | Notes |
|---|---|
| `Button` | Variants: `primary`, `secondary`, `tertiary`, `outline`, `ghost`. Pill-shaped, 56px tall. Small/table-row variant needed too (mockups use a smaller pill button inside table rows) |
| `Input` | Pill-shaped, 56px tall, label/error props, optional leading icon (search, mail, lock) |
| `Select` | Native `<select>` under pill styling with chevron icon |
| `Textarea` | Softer rectangle radius, used in the advocacy editor and rejection-notes modal |
| `Card` | `rounded-card bg-surface-container-lowest shadow-atmospheric`, optional `padding` prop |
| `Modal` | Fixed overlay + glassmorphic (`bg-white/70 backdrop-blur-xl`) centered panel. Used for delete/confirm and doctor approve-reject dialogs |
| `Badge` | Pill status label using accent-bg/fg token pairs (Active/Pending/Suspended/Paid/Refunded/Draft/Published/Scheduled, etc.) |
| `Table` | Header row, sortable column affordance, hover row state, row-actions column that reveals on hover, empty state |
| `Pagination` | Numbered pages + prev/next, "Showing X to Y of Z entries" label |
| `StatCard` / KPI card | Label, big number, trend delta (up/down arrow + %), used on Dashboard and Commission Reports |
| `AdminShell` | Replaces `Sidebar.tsx` + `Topbar.tsx` + `dashboard/layout.tsx`: fixed 288px (`w-72`) sidebar, pill active-state nav, logout pinned at bottom; sticky topbar with search, notifications, profile |

## Layout conventions

- **`AdminShell`** is the single shared layout for every `/dashboard/**` route, replacing today's separate `Sidebar` + `Topbar`.
- Sidebar nav order: Dashboard, Users, Doctors, Orders, Partners, Advocacy (matches `Sidebar.tsx` today; Advocacy and Doctors keep their collapsible sub-items).
- Detail pages get a breadcrumb (`Section > Entity name`) plus a back link, per the mockups' Doctor Detail / Partner Detail / Order Detail / Commission Statement screens.
- List pages: page title + one-line description, primary action button top-right, filter bar card (search + selects), data table card below, pagination in the table card's footer.
- Destructive/decision actions (delete partner, approve/reject doctor) use the glassmorphic `Modal`, not a native `confirm()`.

## Navigation mapping (Stitch mockup → real route)

| Mockup title | Real route |
|---|---|
| Admin Dashboard | `/dashboard` |
| PlanAmWell Admin Login | `/auth/login` (Register at `/auth/register`, no separate mockup) |
| Advocacy Articles | `/dashboard/advocacy` |
| Advocacy Analytics Summary | `/dashboard/advocacy/analytics` |
| Article Preview | `/dashboard/advocacy/view` |
| Article Editor | `/dashboard/advocacy/create`, `/dashboard/advocacy/edit`, `/dashboard/advocacy/editor` |
| Doctor Management List ("Provider Management") | `/dashboard/doctors` |
| Doctor Detail & Approval | `/dashboard/doctors/detail` |
| Commission Breakdown / Commission Reports Overview | `/dashboard/orders/commission` |
| Individual Earner Commission Statement | *(new — no current route; linked from commission breakdown row)* |
| Order Detail | `/dashboard/orders/detail` |
| Orders Management ("Pharmacy Orders") | `/dashboard/orders` |
| Partners | `/dashboard/partners` |
| Partner Detail | `/dashboard/partners/detail` |
| Add Partner | `/dashboard/partners/create` |
| Edit Partner | `/dashboard/partners/edit` |
| Users Management List | `/dashboard/users` |
| User Detail | `/dashboard/users/detail` |
| System Settings (mockup only) | *(not a real feature — no route; ignore)* |

## Migration status

Foundation (tokens in `globals.css`, `app/components/ui/*`, `AdminShell`) must land before any screen below is migrated.

- [x] Foundation: tokens (`app/globals.css`) + component library (`app/components/ui/*`) + `AdminShell` (`app/components/layout/AdminShell.tsx`, replaces `Sidebar.tsx`/`Topbar.tsx`)
- [ ] Auth: Login / Register
- [x] Dashboard overview — `ModernStatsCards`/`GrowthBarChart`/`DoctorStatusChart`/`RecentUsers`/`PendingDoctors` restyled onto tokens; `RecentUsers`'s auto-scrolling carousel replaced with a static "5 most recent" list (matches the mockup and this system's data-dense/professional-tone conventions — carousels don't fit either); `PendingDoctors` kept as a full data table rather than the mockup's simplified list, since the real approve/reject/tabs functionality needed the extra columns
- [x] Users: list (card grid → data table, client-side search/filter/pagination), detail (rebuilt on `getAUser(id)` instead of fetching the full user list and `.find()`-ing client-side — same bug-fix logic already used by the Dashboard's user modal; no fabricated fields/actions — the mockup's staff-account layout (Reset Password, 2FA, consultation stats, activity log) doesn't apply, this is an end-user/patient record, so the detail page only shows real `AdminService` fields)
- [x] Doctors: list (card grid → data table, status badges, search/status filter, pagination), detail (bento profile + info + availability table), approve/reject now go through a confirm `Modal` instead of firing on click — applied both on the detail page and the Dashboard's `PendingDoctors` panel, for consistency. No `getDoctorById` endpoint exists, so detail still fetches the full list and finds by id client-side (unlike Users) — not a regression, just the only option available today; worth a real single-doctor endpoint later.
- [x] Orders: list (already table-based pre-migration, restyled onto tokens/components), detail, commission report — all three shared duplicated status-color/Badge logic, now factored into `app/lib/orderStatus.ts` (`orderStatusTone`/`statusLabel`), used by all three plus available for future order-related screens. **Commission statement dropped**: the mockup's "Individual Earner Commission Statement" assumes a per-doctor/per-partner payout model (commission rate, bank details, per-earner transaction history) that doesn't exist here — this app's real commission feature (`getCommissionReportService`) is a per-order monthly report, not a per-earner one, so there's nothing to build that route against without fabricating backend capability.
- [x] Partners: list (card grid → data table + stats + search/type filter + pagination), detail (Overview/Orders/Commission tabs preserved, Commission tab kept as its pre-existing "coming soon" placeholder — not fabricated), create and edit (full forms — partner type toggle, image upload, social links repeater, description — rebuilt on `Input`/`Textarea`/`Button`), delete confirmation moved from a hand-rolled modal to the shared `Modal`. Dropped the Orders-tab "Export" button — it had no `onClick` handler in the original code, i.e. it never did anything; not carried forward rather than fabricating a handler for it.
- [x] Advocacy: list, create, edit, two preview routes, analytics summary + per-article analytics — all restyled. Three real bugs/gaps found and fixed along the way (all directly within this screen's own scope, not unrelated cleanup):
  - **List used the public endpoint** (`getPublicArticles`, published-only) instead of the admin one — meaning there was no way to reach a draft article's edit page through the UI at all. Switched to `adminGetAllArticles`.
  - **`/dashboard/advocacy/editor`** was a `page.tsx` exporting a component that takes `{content, onChange}` props — Next.js App Router would never supply those, so visiting it directly would crash. It was also completely unreferenced. Extracted its Tiptap logic into a real shared component, `app/components/advocacy/ArticleEditor.tsx` (now used by both Create and Edit, restyled with the mockup's pill toolbar), and deleted the broken route.
  - **Edit's content field was a plain `<textarea>`** (raw HTML), a regression from Create's full Tiptap editor — now both use the same `ArticleEditor`.
  - `/dashboard/advocacy/views` (admin, id-based preview) had `<img src={article.featuredImage}>` — `featuredImage` is `{url, alt}`, so this rendered a broken image. Fixed to `.url`. This route was also unreferenced from anywhere in the UI; wired it in as the list's "Preview" action instead of the public slug-based `/view` (which can't preview unpublished drafts).
  - Create/Edit now have separate **Save Draft** / **Publish** buttons (matching the mockup) instead of a status `<select>` + one submit button — both just call the existing update/create endpoint with a different `status` value, no new backend capability implied.
  - Delete (`adminDeleteArticle`, already existed but wasn't wired into the UI) added to the list via the shared confirm `Modal`.
