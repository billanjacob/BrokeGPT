/* ============================================================
   BUDGET PLANNER — HELPERS
   ============================================================ */

/** Returns saved allocations or the shipped defaults. */
function getBudgetAllocations() {
  return appData.settings.budgetAllocations
    ? deepClone(appData.settings.budgetAllocations)
    : deepClone(DEFAULT_BUDGET_ALLOCATIONS);
}

/** Computes one budget row given salary, allocation config, and category spending totals. */
function calcBudgetRow(salary, alloc, catTotals) {
  const budget = (alloc.percentage / 100) * salary;
  const spent = alloc.expCat
    ? alloc.expCat.reduce((s, cat) => s + (catTotals[cat] || 0), 0)
    : 0;
  const remaining = budget - spent;
  const pctUsed = budget > 0 ? (spent / budget) * 100 : 0;
  let status;
  if (pctUsed < 80) status = '🟢';
  else if (pctUsed <= 100) status = '🟡';
  else status = '🔴';
  return { ...alloc, budget, spent, remaining, pctUsed: Math.min(pctUsed, 100), status };
}

/** Computes all budget rows for a given month. */
function calcBudgetRows(monthId) {
  const month = appData.months[monthId];
  const salary = month ? (month.salary || 0) : 0;
  const catTotals = calcCategoryTotals(monthId);
  return getBudgetAllocations().map(alloc => calcBudgetRow(salary, alloc, catTotals));
}

/** Returns a health label and CSS class based on how much of salary remains. */
function getBudgetHealth(salary, totalSpent) {
  if (!salary || salary <= 0) return { label: '—', cssClass: 'muted' };
  const remainingPct = ((salary - totalSpent) / salary) * 100;
  if (remainingPct > 30) return { label: 'Excellent', cssClass: 'success' };
  if (remainingPct > 20) return { label: 'Good', cssClass: 'primary' };
  if (remainingPct > 10) return { label: 'Caution', cssClass: 'warning' };
  return { label: 'Critical', cssClass: 'danger' };
}

/* ============================================================
   CALCULATIONS
   ============================================================ */

function calcMonthStats(monthId) {
  const month = appData.months[monthId];
  if (!month) {
    return {
      salary: 0, totalSpent: 0, remaining: 0, savings: 0,
      percentSpent: 0, dailyLimit: 0, daysRemaining: 0,
      count: 0, dayOfMonth: 1, daysInMonth: 30,
    };
  }
  const salary = month.salary || 0;
  const expenses = month.expenses || [];
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = Math.max(0, salary - totalSpent);
  const savings = salary - totalSpent;
  const pctSpent = salary > 0 ? (totalSpent / salary) * 100 : 0;
  const isCurrentMonth = monthId === getCurrentMonthId();
  const daysInMon = getDaysInMonth(month.year, month.month);
  const dayOfMon = isCurrentMonth ? getDayOfMonth() : daysInMon;
  const daysRemain = isCurrentMonth ? getDaysRemainingInMonth() : 0;
  const dailyLimit = daysRemain > 0 ? remaining / daysRemain : 0;
  // 50% rule: non-loan expenses should stay under half of salary
  const nonLoanSpent = expenses
    .filter(e => !e.name.toLowerCase().includes('loan'))
    .reduce((s, e) => s + e.amount, 0);
  const halfSalary = salary * 0.5;
  const nonLoanRemaining = halfSalary - nonLoanSpent;
  const nonLoanPct = halfSalary > 0 ? (nonLoanSpent / halfSalary) * 100 : 0;
  return {
    salary, totalSpent, remaining, savings,
    percentSpent: pctSpent, dailyLimit, daysRemaining: daysRemain,
    count: expenses.length, dayOfMonth: dayOfMon, daysInMonth: daysInMon,
    nonLoanSpent, nonLoanRemaining, nonLoanPct, halfSalary,
  };
}

function calcCategoryTotals(monthId) {
  const month = appData.months[monthId];
  if (!month) return {};
  const totals = {};
  (month.expenses || []).forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  return totals;
}

function getLastNMonths(n) {
  const now = new Date();
  const result = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    result.push(`${y}-${m}`);
  }
  return result;
}

function getMonthsInRange(from, to) {
  const result = [];
  let [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  while (fy < ty || (fy === ty && fm <= tm)) {
    result.push(`${fy}-${String(fm).padStart(2, '0')}`);
    fm++;
    if (fm > 12) { fm = 1; fy++; }
  }
  return result;
}

/* ============================================================
   FILTERING
   ============================================================ */

function filterExpenses(expenses, filter, from, to, catFilter, search) {
  const today = getTodayStr();
  const now = new Date();

  return expenses.filter(e => {
    // Time filter
    if (filter === 'today') {
      if (e.date !== today) return false;
    } else if (filter === 'week') {
      const d = new Date(e.date + 'T00:00:00');
      const diffDays = (now - d) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) return false;
    } else if (filter === 'custom') {
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;
    }
    // 'month' and 'all' pass through — month is already scoped by renderExpenses
    // Category filter
    if (catFilter && catFilter !== 'all' && e.category !== catFilter) return false;
    // Search
    if (search) {
      const q = search.toLowerCase();
      const nameMatch = e.name.toLowerCase().includes(q);
      const catMatch = e.category.toLowerCase().includes(q);
      const amtMatch = String(e.amount).includes(q);
      if (!nameMatch && !catMatch && !amtMatch) return false;
    }
    return true;
  });
}

function groupExpensesByDate(expenses, dir = 'desc') {
  const groups = {};
  expenses.forEach(e => {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => dir === 'desc' ? b.localeCompare(a) : a.localeCompare(b))
    .map(([date, exps]) => ({ date, expenses: exps }));
}
