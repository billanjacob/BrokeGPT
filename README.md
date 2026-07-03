# BrokeGPT

> **Powered by regret.**

A production-quality personal finance tracker built with pure HTML, CSS, and Vanilla JavaScript. No frameworks, no build tools, no backend — just open `index.html` and start tracking your inevitable financial decline.

---

## Screenshots

| Dashboard | Expenses | Analytics |
|-----------|----------|-----------|
| *(Add screenshot here)* | *(Add screenshot here)* | *(Add screenshot here)* |

---

## Features

### Core
- **Monthly salary tracking** — Set your salary once per month, edit anytime
- **Expense management** — Add, edit, and delete expenses with name, amount, category, date, and notes
- **Fixed expenses** — Auto-copied to every new month (Car EMI, rent, subscriptions, etc.)
- **Dashboard** — Real-time stats: salary, spent, remaining, savings, daily limit, days remaining
- **Progress bar** — Visual month progress with percentage

### Insights
- **Analytics** — Monthly spending bar chart, category donut chart, savings trend line chart
- **Category breakdown** — Spending by category with percentages
- **Monthly history** — Browse all past months forever

### Productivity
- **Live search** — Instant search by name, category, or amount
- **Smart filters** — Today, this week, this month, or custom date range
- **Category filter** — Filter expenses by any category
- **50+ funny quotes** — A new quote every page load to ease your financial pain

### Data
- **Local Storage** — All data stored locally, no account needed
- **JSON backup** — Export all data, import to restore
- **Data validation** — Imported backups are validated before applying

### UX
- **Dark mode** — Full dark/light theme toggle
- **Responsive design** — Desktop, tablet, and mobile
- **Keyboard shortcuts** — `Ctrl+N`, `Ctrl+F`, `Ctrl+D`, `ESC`
- **Toast notifications** — Animated success/error/warning/info toasts
- **Smooth animations** — Transitions, modal animations, progress bars
- **Accessible** — ARIA labels, keyboard navigation, focus styles, semantic HTML

---

## Getting Started

### Local
1. Download or clone this repository
2. Open `index.html` in any modern browser
3. No installation, no npm, no build step required

### GitHub Pages
1. Fork this repository
2. Go to **Settings → Pages**
3. Set source to **main branch, / (root)**
4. Your app is live at `https://yourusername.github.io/BrokeGPT/`

---

## Project Structure

```
BrokeGPT/
│
├── index.html          # Application shell — all views and modals
├── style.css           # Complete CSS with dark mode and animations
├── script.js           # Full application logic (~3000 lines)
├── README.md           # This file
│
└── assets/
    ├── logo.svg        # Brand logo
    └── favicon.svg     # Browser favicon
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic markup, ARIA accessibility |
| CSS3 | Custom properties, animations, glassmorphism, responsive layout |
| Vanilla JavaScript (ES6+) | All application logic, Canvas charts, Local Storage |
| Material Symbols Rounded | Icons (loaded from Google Fonts CDN) |
| Inter Font | Typography (loaded from Google Fonts CDN) |
| Canvas API | Charts — no external chart libraries |

---

## Data Storage

All data is stored under a single Local Storage key: `brokegpt-data`

```json
{
  "version": "1.0.0",
  "settings": { "darkMode": false, "currency": "₹", "defaultSalary": 0 },
  "categories": ["Food", "Fuel", "Shopping", "..."],
  "fixedExpenses": [{ "id": "...", "name": "Car EMI", "amount": 14400, "category": "EMI" }],
  "months": {
    "2025-06": {
      "id": "2025-06",
      "salary": 50000,
      "expenses": [{ "id": "...", "name": "Groceries", "amount": 500, "category": "Food", "date": "2025-06-15" }],
      "createdAt": "2025-06-01T00:00:00.000Z"
    }
  }
}
```

The structure is designed for easy migration to any database (MongoDB, PostgreSQL, Firebase, etc.) in the future.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | Add new expense |
| `Ctrl + F` | Focus search |
| `Ctrl + D` | Toggle dark mode |
| `ESC` | Close any open modal |

---

## Future Roadmap

- [ ] PWA support (offline, installable)
- [ ] Budget limits per category
- [ ] Recurring expense scheduling (weekly, quarterly, yearly)
- [ ] Multiple accounts / wallets
- [ ] Bill reminders / due date alerts
- [ ] CSV export
- [ ] Cloud sync (optional, opt-in)
- [ ] Goals and savings targets
- [ ] Exchange rate API for multi-currency
- [ ] Spending insights and AI-powered suggestions

---

## License

MIT License — do whatever you want with it. Just don't blame us for your financial decisions.

---

## Contributing

Pull requests welcome. For major changes, open an issue first to discuss what you'd like to change.

---

*Built with love, late nights, and the very real fear of checking a bank balance.*
