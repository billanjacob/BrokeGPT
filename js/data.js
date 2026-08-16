/* ── Supabase client ──────────────────────────────────────── */
const SUPABASE_URL = 'https://ixnfbwjmqvnqhobyyxnv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bmZid2ptcXZucWhvYnl5eG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM0ODYwNTksImV4cCI6MjAwOTA2MjA1OX0.goNJAmWlkw-ob3aGdlpXPitdDggc5cdH3QwzkJ6wUBM';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ============================================================
   AUTH
   ============================================================ */

function getLoggedInUser() {
  return localStorage.getItem('brokegpt-user');
}

function setLoggedInUser(userid) {
  localStorage.setItem('brokegpt-user', userid);
}

function clearLoggedInUser() {
  localStorage.removeItem('brokegpt-user');
}

async function attemptLogin(userid, password) {
  const { data, error } = await db
    .from('tbl_users')
    .select('id')
    .eq('userid', userid)
    .eq('password', password)
    .single();
  if (error || !data) return false;
  setLoggedInUser(userid);
  return true;
}

/* ============================================================
   DATA LAYER
   ============================================================ */

async function loadData() {
  try {
    const [settingsRes, monthsRes, expensesRes] = await Promise.race([
      Promise.all([
        db.from('bgpt_settings').select('*').eq('id', 1).single(),
        db.from('bgpt_months').select('*'),
        db.from('bgpt_expenses').select('*'),
      ]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 6000)),
    ]);

    const raw = settingsRes.data;
    const settings = raw ? {
      darkMode: raw.dark_mode ?? false,
      currency: raw.currency ?? '₹',
      defaultSalary: raw.default_salary ?? 0,
      budgetAllocations: raw.budget_allocations ?? null,
      customCategoryMeta: raw.custom_category_meta ?? {},
    } : deepClone(DEFAULT_DATA.settings);

    const categories = raw?.categories ?? [...DEFAULT_CATEGORIES];
    DEFAULT_CATEGORIES.forEach(cat => { if (!categories.includes(cat)) categories.unshift(cat); });

    const months = {};
    (monthsRes.data || []).forEach(m => {
      const [y, mo] = m.id.split('-');
      months[m.id] = {
        id: m.id, year: parseInt(y), month: parseInt(mo),
        salary: m.salary ?? 0, salarySet: m.salary_set ?? false, expenses: [],
      };
    });

    (expensesRes.data || []).forEach(e => {
      if (months[e.month_id]) {
        months[e.month_id].expenses.push({
          id: e.id, name: e.name, amount: e.amount,
          category: e.category, date: e.date, note: e.note || '',
          mode: e.mode || 'Cash', timestamp: e.timestamp,
          paid: e.paid ?? false,
        });
      }
    });

    cloudAvailable = true;
    return { version: APP_VERSION, settings, categories, months };
  } catch {
    cloudAvailable = false;
    return deepClone(DEFAULT_DATA);
  }
}

/* ── Targeted sync helpers (fire-and-forget) ─────────────────────────────── */

function syncSettings() {
  if (!cloudAvailable) return;
  db.from('bgpt_settings').upsert({
    id: 1,
    dark_mode: appData.settings.darkMode,
    currency: appData.settings.currency,
    default_salary: appData.settings.defaultSalary,
    budget_allocations: appData.settings.budgetAllocations,
    categories: appData.categories,
    custom_category_meta: appData.settings.customCategoryMeta || {},
  }).then(({ error }) => {
    if (error) showToast('Cloud sync error. Changes may not be saved.', 'error');
  });
}

function syncMonth(monthId) {
  if (!cloudAvailable) return;
  const m = appData.months[monthId];
  if (!m) return;
  db.from('bgpt_months').upsert({
    id: monthId, salary: m.salary, salary_set: m.salarySet,
  }).then(({ error }) => {
    if (error) showToast('Cloud sync error. Changes may not be saved.', 'error');
  });
}

function syncInsertExpense(monthId, expense) {
  if (!cloudAvailable) return;
  db.from('bgpt_expenses').insert({
    id: expense.id, month_id: monthId, name: expense.name,
    amount: expense.amount, category: expense.category, date: expense.date,
    note: expense.note || '', mode: expense.mode || 'Cash', timestamp: expense.timestamp,
    paid: expense.paid ?? false,
  }).then(({ error }) => {
    if (error) showToast('Cloud sync error. Changes may not be saved.', 'error');
  });
}

function syncUpdateExpense(expense) {
  if (!cloudAvailable) return;
  db.from('bgpt_expenses').update({
    name: expense.name, amount: expense.amount, category: expense.category,
    date: expense.date, note: expense.note || '', mode: expense.mode || 'Cash',
    paid: expense.paid ?? false,
  }).eq('id', expense.id).then(({ error }) => {
    if (error) showToast('Cloud sync error. Changes may not be saved.', 'error');
  });
}

function syncDeleteExpense(expenseId) {
  if (!cloudAvailable) return;
  db.from('bgpt_expenses').delete().eq('id', expenseId).then(({ error }) => {
    if (error) showToast('Cloud sync error. Changes may not be saved.', 'error');
  });
}

/* ============================================================
   MONTH MANAGEMENT
   ============================================================ */

function ensureMonth(monthId) {
  if (!appData.months[monthId]) {
    const [y, m] = monthId.split('-');
    appData.months[monthId] = {
      id: monthId, year: parseInt(y), month: parseInt(m),
      salary: appData.settings.defaultSalary || 0,
      salarySet: false, expenses: [],
    };
    syncMonth(monthId);
  }
  return appData.months[monthId];
}

function getAllMonths() {
  return Object.values(appData.months).sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.month - a.month;
  });
}

function getBudgetMonthIds() {
  const allIds = Object.keys(appData.months).sort();
  if (budgetTimeFilter === 'last-month') {
    const [y, m] = currentMonthId.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    const lastId = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return appData.months[lastId] ? [lastId] : [];
  }
  if (budgetTimeFilter === 'range') {
    const from = budgetRangeFrom || currentMonthId;
    const to = budgetRangeTo || currentMonthId;
    return allIds.filter(id => id >= from && id <= to);
  }
  if (budgetTimeFilter === 'all') return allIds.length ? allIds : [currentMonthId];
  return [currentMonthId];
}

/* ============================================================
   BACKUP — EXPORT
   ============================================================ */

function exportBackup() {
  const json = JSON.stringify(appData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `brokegpt-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Backup exported successfully!', 'success');
}
