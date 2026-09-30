# UI Context

Pulled directly from `frontend/src/lib/theme.tsx`, `index.css`, and
`tailwind.config.js` — these are real values, not placeholders.

## Theme

- Light/dark via React context (`ThemeProvider`/`useTheme` in
  `lib/theme.tsx`), not Tailwind's `dark:` class strategy — every themed
  value is read from `tokens` at render time, not from a CSS class
- Default theme is **light**
- Toggling is in-memory only (`useState`) — refreshing the page resets to
  light; there's no persistence (localStorage/cookie) yet

## Colors

All colors are defined as two flat token objects (`LIGHT`, `DARK`) in
`lib/theme.tsx`, consumed via `const { tokens } = useTheme()` — never
hardcode a hex value in a component; add it to both token objects instead.

| Role            | Token             | Light     | Dark      |
| --------------- | ----------------- | --------- | --------- |
| Page background | `pageBg`          | `#F9FAFB` | `#121212` |
| Card background | `cardBg`          | `#FFFFFF` | `#1E1E1E` |
| Card border     | `cardBorder`      | `#E5E7EB` | `#2E2E2E` |
| Accent          | `accent`          | `#1A1A1A` | `#F5F5F5` |
| Primary text    | `textPrimary`     | `#111827` | `#F5F5F5` |
| Secondary text  | `textSecondary`   | `#6B7280` | `#A0A0A0` |
| Muted text      | `textMuted`       | `#9CA3AF` | `#737373` |
| Row hover       | `rowHover`        | `#F3F4F6` | `#262626` |
| Danger          | `dangerText`/`Bg` | `#EF4444` / `#FEF2F2` | `#F87171` / `#3B1414` |
| Success         | `successText`/`Bg`| `#10B981` / `#ECFDF5` | `#34D399` / `#0F2A1E` |
| Warning         | `warningText`/`Bg`| `#F59E0B` / `#FFFBEB` | `#FBBF24` / `#3A2A0A` |

### Risk badges (`badgeHigh/Medium/Low` + `Bg`/`Text`)

| Tier   | Light bg  | Light text | Dark bg   | Dark text |
| ------ | --------- | ---------- | --------- | --------- |
| High   | `#FEE2E2` | `#B91C1C`  | `#3B1414` | `#F87171` |
| Medium | `#FEF3C7` | `#B45309`  | `#3A2A0A` | `#FBBF24` |
| Low    | `#D1FAE5` | `#047857`  | `#0F2A1E` | `#34D399` |

### Offer status badges (`badgePending/Accepted/Rejected`)

Pending uses the same neutral bg/text as `accentSoftBg`/`textSecondary`;
Accepted mirrors the Low risk colors; Rejected mirrors the High risk colors
(see `theme.tsx` for the exact `badge*Bg`/`badge*Text` pairs).

### Risk progress bar (not theme-dependent — same in light and dark)

From `lib/format.ts`'s `progressColor(risk)`:
- `risk > 70` → `#EF4444` (red)
- `risk > 40` → `#F59E0B` (amber)
- else → `#10B981` (green)

## Typography

- Font: `Inter`, falling back to `system-ui, sans-serif` (set in both
  `tailwind.config.js`'s `fontFamily.sans` and `index.css`'s `body`)
- Header logo text uses a fluid size: `clamp(14px, 3.5vw, 18px)`

## Component Library

Plain Tailwind CSS (no shadcn/ui, no Radix, no component library) — this
is the original Bolt.new scaffold. Icons are **lucide-react**
(`Sun`/`Moon` used in `ThemeToggle`, etc.). Styling is applied two ways in
this codebase: Tailwind utility classes for structure/spacing, and inline
`style={{ ... }}` for anything theme-token-driven (colors) since the
tokens are runtime JS values, not Tailwind classes.

## Layout Patterns

- **Dashboard**: `CustomerTable` is the main view; row click opens
  `CustomerModal` (customer detail) or `PredictModal` (run a prediction)
- **AI sidebar** (`AISidebar.tsx`): slides in from the right via a CSS
  `slideIn` keyframe (`translateX(100%)` → `translateX(0)`) defined in
  `index.css`; its header is fixed at the top of the panel and never
  scrolls — only the chat body scrolls (`.chat-scroll` class, with a thin
  6px custom scrollbar)
- **Header** (`.header-scroll` class): nav + actions sit in a horizontally
  scrollable row so nothing is ever clipped on narrow viewports; the
  scrollbar itself is hidden (`scrollbar-width: none` / WebKit
  `::-webkit-scrollbar { display: none }`), and it scrolls via touch
  (`touch-action: pan-x`) without hijacking the page's vertical scroll.
  The logo sits outside this scroll container so it's always visible.
- **Table** (`.table-scroll` class): same horizontal-scroll-only pattern,
  scoped to the table so it doesn't affect page scroll
- **Account menu**: dropdown from `AccountDropdown.tsx`, portal-rendered
  (see `architecture.md` for the outside-click-handling invariant)

## Icons

`lucide-react` (e.g. `Sun`, `Moon` for the theme toggle)
