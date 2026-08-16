# BrokeGPT

> **Powered by regret.**

A production-quality personal finance tracker built with pure HTML, CSS, and Vanilla JavaScript. Backed by Supabase for cloud persistence. No frameworks, no build tools — just open `index.html` and start tracking your inevitable financial decline.

---

## Features

### Core
- **Monthly salary tracking** — Set your salary once per month, edit anytime
- **Expense management** — Add, edit, and delete expenses with name, amount, category, date, note, and payment mode
- **Dashboard** — Real-time stats: salary, spent, remaining, savings, daily limit, days remaining
- **Progress bar** — Visual month progress with percentage and day counter

### Insights
- **Analytics** — Monthly spending bar chart, category donut chart, savings trend line chart
- **Category breakdown** — Spending by category with bar graphs and percentages
- **Trends** — Multi-month category comparison with heatmap table
- **Monthly history** — Browse all past months

### Budget Planner
- **9-row budget allocation** — EMI, Food, Fuel, Bills, Entertainment, Shopping, Medical, Savings, Emergency
- **Editable percentages** — Customise allocations, validated to sum to 100%
- **Health indicator** — Excellent / Good / Caution / Critical based on remaining salary
- **Multi-period view** — This month, last month, date range, or all time

### 50% Rule
- Tracks non-loan expenses against 50% of salary
- Automatically excludes expenses whose name contains "loan"
- Shows remaining headroom on dashboard

### UX
- **Dark mode** — Full dark/light theme toggle
- **Tile / List view** — Toggle between grouped list and tile grid for expenses
- **Payment mode** — GPay or Cash badge on every expense; GPay auto-detected by keyword
- **Smart category guess** — Expense name auto-maps to a category via keyword rules
- **Duplicate detection** — Warns when adding an expense that matches an existing one
- **Responsive design** — Desktop, tablet, and mobile
- **Keyboard shortcuts** — `Ctrl+N`, `Ctrl+F`, `Ctrl+D`, `ESC`
- **Toast notifications** — Animated success / error / warning / info toasts
- **Accessible** — ARIA labels, keyboard navigation, focus styles, semantic HTML

### Data
- **Supabase cloud sync** — All data stored in Supabase; falls back to defaults on timeout
- **JSON backup / restore** — Export all data as JSON; import to restore

---

## Getting Started

1. Clone or download the repository
2. Open `index.html` in any modern browser (or serve via any static host)
3. Log in with your Supabase-backed user credentials
4. No npm, no build step required

---

## Project Structure

```
BrokeGPT/
├── index.html          # App shell — all views and modals
├── style.css           # CSS custom properties, dark mode, all component styles
├── js/
│   ├── constants.js    # DEFAULT_CATEGORIES, CATEGORY_META, keyword rules, palettes
│   ├── state.js        # All mutable app state variables
│   ├── utils.js        # Pure helper functions (formatting, dates, etc.)
│   ├── data.js         # Supabase client, loadData(), sync helpers
│   ├── calc.js         # Budget/analytics calculations, filtering, grouping
│   ├── render.js       # All DOM rendering functions
│   └── app.js          # init(), navigateTo(), event wiring, keyboard shortcuts
├── assets/
│   └── brokegpt.svg    # Brand logo / favicon
├── CLAUDE.md           # AI assistant project notes
└── README.md           # This file
```

> `script.js` at the root is NOT loaded by `index.html` — do not edit it.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic markup, ARIA accessibility |
| CSS3 | Custom properties, animations, responsive layout |
| Vanilla JavaScript (ES6+) | All application logic, Canvas charts |
| Supabase JS SDK (CDN) | Cloud database read/write |
| Material Symbols Rounded | Icons (Google Fonts CDN) |
| Inter Font | Typography (Google Fonts CDN) |
| Canvas API | Charts — no external chart libraries |

---

## Database (Supabase)

Tables: `tbl_users`, `bgpt_settings`, `bgpt_months`, `bgpt_expenses`

See [CLAUDE.md](CLAUDE.md) for the full schema.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | Add new expense |
| `Ctrl + F` | Focus search |
| `Ctrl + D` | Toggle dark mode |
| `ESC` | Close any open modal |

---

## License

MIT License — do whatever you want with it. Just don't blame us for your financial decisions.

---

*Built with love, late nights, and the very real fear of checking a bank balance.*
