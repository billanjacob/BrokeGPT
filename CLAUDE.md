# BrokeGPT — Project Notes

## Tech Stack
Pure HTML + CSS + Vanilla JS (no frameworks). Backend is **Supabase** — data is read/written directly from the browser via the Supabase JS SDK (loaded from CDN). No localStorage — all persistence goes through Supabase.

## Supabase
- Client initialised in `js/app.js` with `SUPABASE_URL` + `SUPABASE_KEY` (anon key)
- Tables: `bgpt_settings`, `bgpt_months`, `bgpt_expenses`, `tbl_users`
- `loadData()` fetches all three app tables on init; a loading screen stays visible until the fetch resolves (6s timeout before falling back to default data)
- Writes: upsert for settings/months, insert/update/delete for expenses — all fire-and-forget (no await at call sites)

## Files
- `index.html` — all views as `<section class="view">` elements; one active at a time
- `style.css` — CSS custom properties for theming; dark mode via `[data-theme="dark"]`
- `js/constants.js` — `DEFAULT_CATEGORIES`, `CATEGORY_META`, `NAME_CATEGORY_RULES`, color/icon palettes
- `js/state.js` — `appData` and other mutable state
- `js/utils.js` — pure helper functions
- `js/data.js` — Supabase `loadData()`, `syncSettings()`, `syncMonth()`
- `js/calc.js` — budget/analytics calculations
- `js/render.js` — all DOM rendering functions
- `js/app.js` — `init()`, event wiring, `navigateTo()`, boots on DOMContentLoaded
- **NOTE: `script.js` at root is NOT loaded by `index.html` — never edit it**

## Views / Nav Order
Dashboard → Expenses → Analytics → Budget → History → Settings

## Data Shape
```
appData.settings: { darkMode, currency, defaultSalary, budgetAllocations (null = use defaults) }
appData.months["2025-06"]: { salary, salarySet, expenses: [...], fixedCopied }
```

## Salary Flow
- Salary is set **per month** via the salary modal (not globally). Saves to `month.salary` + `month.salarySet = true`.
- The user sets salary each month manually; that month's salary is used for all calculations (remaining, savings, 50% rule, budget rows).
- When a new month is first created (`ensureMonth`), it seeds salary from `settings.defaultSalary` (0 unless set in Settings) — but the user always sets it explicitly via the modal.
- The salary modal pre-fills with the current month's existing salary value, or `defaultSalary` if none is set yet.
- `settings.defaultSalary` is a separate Settings field — not the primary salary flow.

## Budget Planner
- `DEFAULT_BUDGET_ALLOCATIONS`: 9 rows summing to 100% (EMI 43%, Food 15%, Fuel 7%, Bills 5%, Entertainment 5%, Shopping 5%, Medical 3%, Savings 12%, Emergency 5%)
- `getBudgetAllocations()` returns saved or default allocations
- `calcBudgetRows(monthId)` computes budget/spent/remaining per row using live expenses
- `getBudgetHealth(salary, spent)` → Excellent (>30% remaining) / Good / Caution / Critical (<10%)
- Saving validates sum === 100% before persisting; Reset sets `budgetAllocations = null`
- Dashboard shows: Total Budgeted + Budget Remaining cards with health indicator

## 50% Rule (Dashboard card)
- Tracks **non-loan expenses vs 50% of salary**
- Filter: excludes any expense whose category name contains `"loan"` (case-insensitive)
- Included: Food, Fuel, Bills, Entertainment, Shopping, Medical, Emergency, and any non-loan category
- Excluded: EMI/Loan, Home Loan, Car Loan, etc. (anything with "loan" in category name)
- Status thresholds: ≥100% → danger, ≥80% → warning, else → success

## Expenses View
- **Tile / List toggle**: `expenseViewMode` (`'list'` | `'tile'`) persisted in **localStorage** (exception to the no-localStorage rule — UI preference only). Toggle button swaps the icon between `grid_view` and `view_list`.
- In tile mode the container gets class `expenses-tile-grid`; each expense renders as `.expense-tile` with a coloured header, icon, amount, name, date, and mode badge.
- In list mode expenses render as the standard `.expense-item` rows.

## Payment Mode (expense field)
- Each expense has a `mode` field: `'Cash'` (default) or `'GPay'`.
- Rendered as `.expense-mode-badge` with sub-classes `cash` or `gpay` for distinct styling.
- Both list and tile views display the badge. `'GPay'` is auto-detected via keyword matching in the add-expense flow.

## Categories
- Full list defined in `js/constants.js` — includes `Groceries` (icon: `local_grocery_store`, color: `#16A34A`) and `Gadgets` (icon: `devices`, color: `#6366F1`).
- Keyword matcher maps grocery-related terms (`grocery`, `dmart`, `blinkit`, `zepto`, `vegetables`, `milk`, etc.) → `Groceries` automatically.
- Default categories cannot be removed in Settings; custom categories can be added.

## Last Update Rule
**After every code change, update the Last Updated line in `index.html`.**
- Element: `<div class="about-version" id="about-last-update">` inside the About card in the Settings view (near the bottom of the file)
- Format: `Last Updated: YYYY-MM-DD · U<N>` where `<N>` is a sequential number incremented from the previous value
- Today's date is available in the system context (`currentDate` memory). Always use the actual current date.
- This must be done as part of every PR/commit that changes any project file.

## Architecture Notes
- `navigateTo(view)` handles view switching and calls the right render function
- `refreshCurrentView()` re-renders active view after any data change
- Charts hand-drawn on canvas — no chart library
- `ensureMonth(monthId)` lazily creates month data and copies fixed expenses
