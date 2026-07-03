
/* ============================================================
   BROKEGPT — script.js
   Complete personal finance application logic
   ============================================================ */

/* ── Supabase client ──────────────────────────────────────── */
const SUPABASE_URL = 'https://ixnfbwjmqvnqhobyyxnv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bmZid2ptcXZucWhvYnl5eG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM0ODYwNTksImV4cCI6MjAwOTA2MjA1OX0.goNJAmWlkw-ob3aGdlpXPitdDggc5cdH3QwzkJ6wUBM';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ============================================================
   CONSTANTS
   ============================================================ */

const APP_VERSION = '1.0.0';


const DEFAULT_CATEGORIES = [
  'Restaurant', 'Bakery', 'Fuel', 'Fashion', 'Bills', 'Entertainment',
  'Medical', 'Travel', 'EMI', 'Investment', 'Donation', 'Gifts', 'Other',
  'Stationary', 'Internet', 'Saloon', 'Gym', 'Groceries',
];

const CATEGORY_META = {
  Restaurant:    { icon: 'restaurant',        color: '#EF4444' },
  Bakery:        { icon: 'bakery_dining',      color: '#F97316' },
  Fuel:          { icon: 'local_gas_station',  color: '#F59E0B' },
  Fashion:       { icon: 'checkroom',          color: '#EC4899' },
  Bills:         { icon: 'receipt_long',       color: '#8B5CF6' },
  Entertainment: { icon: 'movie',              color: '#06B6D4' },
  Medical:       { icon: 'medical_services',   color: '#10B981' },
  Travel:        { icon: 'flight',             color: '#3B82F6' },
  EMI:           { icon: 'credit_card',        color: '#6366F1' },
  Investment:    { icon: 'trending_up',        color: '#22C55E' },
  Donation:      { icon: 'volunteer_activism', color: '#F43F5E' },
  Gifts:         { icon: 'card_giftcard',      color: '#A855F7' },
  Other:         { icon: 'category',           color: '#64748B' },
  Stationary:    { icon: 'edit_note',          color: '#0EA5E9' },
  Internet:      { icon: 'wifi',               color: '#0284C7' },
  Saloon:        { icon: 'content_cut',        color: '#D946EF' },
  Gym:           { icon: 'fitness_center',     color: '#84CC16' },
  Groceries:     { icon: 'local_grocery_store', color: '#16A34A' },
};

const NAME_CATEGORY_RULES = [
  { keywords: ['zomato', 'swiggy', 'restaurant', 'cafe', 'dhaba', 'burger', 'pizza', 'kfc', 'mcdonald', 'dominos', 'subway', 'biryani', 'diner', 'dining', 'eatery', 'mess', 'canteen', 'food court'], category: 'Restaurant' },
  { keywords: ['bakery', 'cake', 'bread', 'pastry', 'bun', 'muffin', 'cookie', 'donut', 'biscuit', 'brownie'], category: 'Bakery' },
  { keywords: ['petrol', 'diesel', 'fuel', 'iocl', 'bpcl', 'hpcl', 'cng', 'filling station', 'shell', 'indian oil', 'bharat petroleum', 'hp fuel'], category: 'Fuel' },
  { keywords: ['myntra', 'ajio', 'zara', 'levis', 'adidas', 'nike', 'clothes', 'clothing', 'shirt', 'trouser', 'pants', 'shoes', 'sandal', 'bag', 'handbag', 'belt', 'dress', 'jeans', 'kurta', 'saree', 'fashion', 'footwear', 'sneaker'], category: 'Fashion' },
  { keywords: ['bsnl', 'jio', 'airtel', 'vodafone', 'vi plan', 'wifi', 'internet', 'broadband', 'recharge', 'mobile bill', 'landline', 'postpaid', 'prepaid', 'data pack'], category: 'Internet' },
  { keywords: ['electricity', 'water bill', 'bescom', 'tneb', 'mseb', 'tata sky', 'd2h', 'dish tv', 'maintenance', 'society'], category: 'Bills' },
  { keywords: ['netflix', 'hotstar', 'spotify', 'prime video', 'youtube premium', 'movie', 'cinema', 'pvr', 'inox', 'theatre', 'concert', 'gaming', 'steam', 'playstation', 'xbox', 'bookmyshow'], category: 'Entertainment' },
  { keywords: ['hospital', 'clinic', 'pharmacy', 'medicine', 'doctor', 'apollo', 'medplus', 'blood test', 'xray', 'scan', 'medical', 'tablet', 'syrup', 'injection', 'health', 'dental', 'dentist', 'lab test', 'diagnostic'], category: 'Medical' },
  { keywords: ['uber', 'ola cab', 'metro', 'irctc', 'redbus', 'rapido', 'flight', 'indigo', 'air india', 'spicejet', 'bus ticket', 'train ticket', 'toll', 'highway', 'travel', 'cab', 'taxi', 'auto ride', 'airport', 'hotel stay'], category: 'Travel' },
  { keywords: ['emi', 'loan emi', 'home loan', 'car loan', 'personal loan', 'bajaj finance', 'hdfc loan', 'icici loan', 'axis loan', 'equitas', 'credit emi'], category: 'EMI' },
  { keywords: ['mutual fund', 'sip', 'zerodha', 'groww', 'stocks', 'shares', 'gold bond', 'fixed deposit', 'ppf', 'nps', 'elss', 'investment', 'lic premium', 'insurance premium'], category: 'Investment' },
  { keywords: ['church', 'donation', 'tithe', 'offering', 'charity', 'ngo', 'temple', 'mosque', 'daan', 'contribution'], category: 'Donation' },
  { keywords: ['gift', 'birthday gift', 'anniversary gift', 'wedding gift', 'present for'], category: 'Gifts' },
  { keywords: ['grocery', 'groceries', 'supermarket', 'dmart', 'bigbasket', 'blinkit', 'zepto', 'jiomart', 'more supermarket', 'reliance fresh', 'nature basket', 'vegetables', 'fruits', 'rice', 'dal', 'wheat', 'atta', 'oil', 'milk', 'eggs', 'provisions'], category: 'Groceries' },
  { keywords: ['stationary', 'pen', 'pencil', 'notebook', 'notepad', 'paper', 'eraser', 'stapler', 'highlighter', 'marker', 'folder', 'file', 'ink'], category: 'Stationary' },
  { keywords: ['saloon', 'salon', 'haircut', 'hair cut', 'barber', 'trimming', 'shaving', 'facial', 'grooming', 'waxing', 'manicure', 'pedicure', 'parlour', 'parlor'], category: 'Saloon' },
  { keywords: ['gym', 'fitness', 'workout', 'membership', 'protein', 'whey', 'supplement', 'crossfit', 'yoga', 'zumba', 'sports fee', 'sports kit'], category: 'Gym' },
];

const ICON_PICKER_OPTIONS = [
  'category',       'shopping_bag',     'local_grocery_store', 'coffee',
  'lunch_dining',   'fastfood',         'ramen_dining',        'local_pizza',
  'directions_car', 'two_wheeler',      'directions_bike',     'hiking',
  'sports_cricket', 'sports_soccer',    'sports_esports',      'self_improvement',
  'music_note',     'movie',            'celebration',         'camera_alt',
  'school',         'work',             'home',                'computer',
  'phone_android',  'pets',             'child_care',          'favorite',
  'local_bar',      'spa',              'construction',        'bolt',
];

const COLOR_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#06B6D4',
  '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6',
  '#A855F7', '#D946EF', '#EC4899', '#F43F5E',
  '#64748B', '#0284C7',
];

const CHART_COLORS = [
  '#2563EB', '#EF4444', '#22C55E', '#F59E0B', '#EC4899',
  '#06B6D4', '#8B5CF6', '#F97316', '#6366F1', '#10B981', '#64748B',
];

/* Default percentage allocations for the Budget Planner.
   expCat: the expense category key this maps to (null = reserved, not tracked as spending). */
const DEFAULT_BUDGET_ALLOCATIONS = [
  { key: 'emi',           label: 'EMI',               percentage: 43, expCat: ['EMI']                        },
  { key: 'food',          label: 'Food & Dining',      percentage: 15, expCat: ['Restaurant', 'Bakery']       },
  { key: 'fuel',          label: 'Fuel & Travel',      percentage: 7,  expCat: ['Fuel', 'Travel']             },
  { key: 'bills',         label: 'Bills & Utilities',  percentage: 5,  expCat: ['Bills']                      },
  { key: 'entertainment', label: 'Entertainment',      percentage: 5,  expCat: ['Entertainment']              },
  { key: 'fashion',       label: 'Fashion & Shopping', percentage: 5,  expCat: ['Fashion']                    },
  { key: 'medical',       label: 'Medical',            percentage: 3,  expCat: ['Medical']                    },
  { key: 'savings',       label: 'Savings',            percentage: 12, expCat: null                           },
  { key: 'emergency',     label: 'Emergency Fund',     percentage: 5,  expCat: null                           },
];

const DEFAULT_DATA = {
  version: APP_VERSION,
  createdAt: new Date().toISOString(),
  settings: {
    darkMode: false,
    currency: '₹',
    defaultSalary: 0,
    budgetAllocations: null,
    customCategoryMeta: {},
  },
  categories: [...DEFAULT_CATEGORIES],
  months: {},
};

/* ============================================================
   APP STATE
   ============================================================ */

let appData = null;
let currentView = 'dashboard';
let currentMonthId = '';
let analyticsMonthId = '';
let activeTimeFilter = 'month';
let activeCatFilter = 'all';
let searchQuery = '';
let customRangeFrom = null;
let customRangeTo = null;
let expenseSortDir = 'desc'; // 'desc' = newest first, 'asc' = oldest first
let editingExpenseId = null;
let newCatIcon = 'category';
let newCatColor = '#64748B';
let editingCatName = null;
let deleteTarget = null;
let deleteContext = null;

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
}

function getCurrentMonthId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function getMonthIdFromDate(dateStr) {
  const [y, m] = dateStr.split('-');
  return `${y}-${m}`;
}

function formatAmountInput(raw) {
  // Keep only digits and one decimal point
  let val = raw.replace(/[^0-9.]/g, '');
  const dotIdx = val.indexOf('.');
  if (dotIdx !== -1) {
    val = val.slice(0, dotIdx + 1) + val.slice(dotIdx + 1).replace(/\./g, '').slice(0, 2);
  }
  const [intPart, decPart] = val.split('.');
  const formatted = intPart ? Number(intPart).toLocaleString('en-IN') : '';
  return decPart !== undefined ? formatted + '.' + decPart : formatted;
}

function parseAmountInput(val) {
  return parseFloat(val.replace(/,/g, '')) || 0;
}

function formatCurrency(amount, currency) {
  const cur = currency || (appData && appData.settings.currency) || '₹';
  const abs = Math.abs(amount);
  const formatted = abs >= 100000
    ? `${(abs / 100000).toFixed(1)}L`
    : abs >= 1000
      ? abs.toLocaleString('en-IN')
      : abs.toFixed(2).replace(/\.00$/, '');
  return `${cur}${formatted}`;
}

function formatFullAmount(amount) {
  const cur = (appData && appData.settings.currency) || '₹';
  return `${cur}${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatMonthName(monthId) {
  if (!monthId) return '';
  const [y, m] = monthId.split('-');
  const d = new Date(parseInt(y), parseInt(m) - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function formatMonthShort(monthId) {
  if (!monthId) return '';
  const [y, m] = monthId.split('-');
  const d = new Date(parseInt(y), parseInt(m) - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function getTodayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getDayOfMonth() {
  return new Date().getDate();
}

function getDaysRemainingInMonth() {
  const now = new Date();
  const lastDay = getDaysInMonth(now.getFullYear(), now.getMonth() + 1);
  return lastDay - now.getDate();
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getCatMeta(category) {
  if (appData?.settings?.customCategoryMeta?.[category]) return appData.settings.customCategoryMeta[category];
  if (CATEGORY_META[category]) return CATEGORY_META[category];
  return { icon: 'category', color: '#64748B' };
}

function getCatColor(category, allCats) {
  if (CATEGORY_META[category]) return CATEGORY_META[category].color;
  const idx = (allCats || DEFAULT_CATEGORIES).indexOf(category);
  return CHART_COLORS[idx % CHART_COLORS.length] || '#64748B';
}

function getCatIcon(category) {
  return (CATEGORY_META[category] && CATEGORY_META[category].icon) || 'category';
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function guessCategory(name) {
  if (!name || name.length < 3) return null;
  const lower = ' ' + name.toLowerCase() + ' ';
  for (const rule of NAME_CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) return rule.category;
    }
  }
  return null;
}

/* ============================================================
   DATA LAYER
   ============================================================ */

let cloudAvailable = false;

/* ============================================================
   AUTH
   ============================================================ */

function getLoggedInUser() {
  return sessionStorage.getItem('brokegpt-user');
}

function setLoggedInUser(userid) {
  sessionStorage.setItem('brokegpt-user', userid);
}

function clearLoggedInUser() {
  sessionStorage.removeItem('brokegpt-user');
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

function setupLoginScreen() {
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('login-submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userid = document.getElementById('login-userid').value.trim();
    const password = document.getElementById('login-password').value;
    if (!userid || !password) return;

    errorEl.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    try {
      const ok = await attemptLogin(userid, password);
      if (ok) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'flex';
        await init();
      } else {
        document.getElementById('login-error-msg').textContent = 'Invalid user ID or password.';
        errorEl.style.display = 'flex';
      }
    } catch {
      document.getElementById('login-error-msg').textContent = 'Could not reach server. Check your connection.';
      errorEl.style.display = 'flex';
    }

    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">login</span> Sign In';
  });
}

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

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
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
  }).then(({ error }) => {
    if (error) showToast('Cloud sync error. Changes may not be saved.', 'error');
  });
}

function syncUpdateExpense(expense) {
  if (!cloudAvailable) return;
  db.from('bgpt_expenses').update({
    name: expense.name, amount: expense.amount, category: expense.category,
    date: expense.date, note: expense.note || '', mode: expense.mode || 'Cash',
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

/** Updates the two budget summary cards on the dashboard. */
function renderDashboardBudgetCards() {
  const month = appData.months[currentMonthId];
  const salary = month ? (month.salary || 0) : 0;
  const stats = calcMonthStats(currentMonthId);
  const allocs = getBudgetAllocations();
  const totalBudgeted = salary > 0
    ? allocs.reduce((s, a) => s + (a.percentage / 100) * salary, 0) : 0;
  const totalRemaining = salary - stats.totalSpent;
  const health = getBudgetHealth(salary, stats.totalSpent);

  const elBudgeted = document.getElementById('stat-budgeted');
  const elBudSub = document.getElementById('stat-budgeted-sub');
  const elBudRem = document.getElementById('stat-budget-remaining');
  const elHealth = document.getElementById('stat-budget-health');
  const elIcon = document.getElementById('stat-budget-health-icon');

  if (elBudgeted) elBudgeted.textContent = salary > 0 ? formatFullAmount(totalBudgeted) : '₹0';
  if (elBudSub) elBudSub.textContent = salary > 0 ? formatMonthName(currentMonthId) : 'Set salary to calculate';

  if (elBudRem) {
    elBudRem.textContent = salary > 0 ? formatFullAmount(Math.max(0, totalRemaining)) : '₹0';
    elBudRem.className = `stat-value ${totalRemaining >= 0 ? 'success' : 'danger'}`;
  }
  if (elHealth) elHealth.textContent = health.label !== '—' ? `Health: ${health.label}` : 'Set salary to calculate';
  if (elIcon) elIcon.className = `stat-icon ${health.cssClass}`;
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
  const pctSpent = salary > 0 ? Math.min(100, (totalSpent / salary) * 100) : 0;
  const isCurrentMonth = monthId === getCurrentMonthId();
  const daysInMon = getDaysInMonth(month.year, month.month);
  const dayOfMon = isCurrentMonth ? getDayOfMonth() : daysInMon;
  const daysRemain = isCurrentMonth ? getDaysRemainingInMonth() : 0;
  const dailyLimit = daysRemain > 0 ? remaining / daysRemain : 0;
  return {
    salary, totalSpent, remaining, savings,
    percentSpent: pctSpent, dailyLimit, daysRemaining: daysRemain,
    count: expenses.length, dayOfMonth: dayOfMon, daysInMonth: daysInMon,
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

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconMap = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast-icon"><span class="material-symbols-rounded">${iconMap[type] || 'info'}</span></span>
    <span class="toast-msg">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Dismiss"><span class="material-symbols-rounded">close</span></button>
    <div class="toast-bar" style="animation-duration:${duration}ms"></div>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => removeToast(toast));

  container.appendChild(toast);

  const timer = setTimeout(() => removeToast(toast), duration);
  toast._timer = timer;
}

function removeToast(toast) {
  if (!toast || !toast.parentNode) return;
  clearTimeout(toast._timer);
  toast.classList.add('removing');
  setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 260);
}

/* ============================================================
   DARK MODE
   ============================================================ */

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const icon = document.getElementById('dark-mode-icon');
  if (icon) icon.textContent = dark ? 'light_mode' : 'dark_mode';
  const settingsToggle = document.getElementById('settings-dark-toggle');
  if (settingsToggle) settingsToggle.checked = dark;
}

function toggleDarkMode() {
  appData.settings.darkMode = !appData.settings.darkMode;
  applyTheme(appData.settings.darkMode);
  syncSettings();
}

/* ============================================================
   NAVIGATION
   ============================================================ */

function navigateTo(viewName) {
  currentView = viewName;

  document.querySelectorAll('.nav-item').forEach(item => {
    const isActive = item.dataset.view === viewName;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.add('active');

  closeSidebar();

  updateMonthNav();

  if (viewName === 'dashboard') renderDashboard();
  if (viewName === 'expenses') renderExpenses();
  if (viewName === 'analytics') renderAnalytics();
  if (viewName === 'budget') renderBudgetPlanner();
  if (viewName === 'history') renderHistory();
  if (viewName === 'settings') renderSettings();
}

/* ============================================================
   SIDEBAR (mobile)
   ============================================================ */

function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggle = document.getElementById('menu-toggle');
  sidebar.classList.add('open');
  overlay.classList.add('active');
  overlay.style.display = 'block';
  toggle.setAttribute('aria-expanded', 'true');
  sidebar.querySelector('.nav-item').focus();
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggle = document.getElementById('menu-toggle');
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  toggle.setAttribute('aria-expanded', 'false');
  setTimeout(() => { if (!sidebar.classList.contains('open')) overlay.style.display = 'none'; }, 300);
}

function toggleSidebar() {
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('open')) closeSidebar();
    else openSidebar();
  } else {
    document.body.classList.toggle('sidebar-collapsed');
  }
}

/* ============================================================
   MODALS
   ============================================================ */

function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.style.display = 'flex';
  requestAnimationFrame(() => {
    const focusable = overlay.querySelector('input, select, textarea, button:not(.modal-close-btn)');
    if (focusable) focusable.focus();
  });
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.style.display = 'none';
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => { m.style.display = 'none'; });
}

/* ============================================================
   CURRENCY PREFIXES
   ============================================================ */

function updateCurrencyPrefixes() {
  const cur = appData.settings.currency || '₹';
  document.querySelectorAll('.input-prefix').forEach(el => { el.textContent = cur; });
}

/* ============================================================
   RENDER — BUDGET PLANNER
   ============================================================ */

function renderBudgetPlanner() {
  const month = appData.months[currentMonthId];
  const salary = month ? (month.salary || 0) : 0;
  const stats = calcMonthStats(currentMonthId);
  const rows = calcBudgetRows(currentMonthId);

  // Subtitle
  const subtitle = document.getElementById('budget-view-subtitle');
  if (subtitle) {
    subtitle.innerHTML = salary > 0
      ? `Allocating <strong>${formatFullAmount(salary)}</strong> for ${formatMonthName(currentMonthId)}`
      : 'Set your monthly salary to see budget calculations';
  }

  // Health card values
  const totalBudgeted = rows.reduce((s, r) => s + r.budget, 0);
  const totalSpent = stats.totalSpent;
  const totalRemaining = salary - totalSpent;
  const health = getBudgetHealth(salary, totalSpent);

  const healthDot = document.getElementById('budget-health-dot');
  const healthValue = document.getElementById('budget-health-value');
  if (healthDot) {
    healthDot.className = `budget-health-indicator health-${health.cssClass}`;
  }
  if (healthValue) {
    healthValue.textContent = health.label;
    healthValue.className = `budget-health-value ${health.cssClass}`;
  }
  const elBudgeted = document.getElementById('budget-total-budgeted');
  const elSpent = document.getElementById('budget-total-spent-val');
  const elRemaining = document.getElementById('budget-total-remaining-val');
  if (elBudgeted) elBudgeted.textContent = formatFullAmount(totalBudgeted);
  if (elSpent) elSpent.textContent = formatFullAmount(totalSpent);
  if (elRemaining) {
    elRemaining.textContent = formatFullAmount(totalRemaining);
    elRemaining.className = `bhm-value ${totalRemaining >= 0 ? 'success' : 'danger'}`;
  }

  // Percentage total badge
  const allocations = getBudgetAllocations();
  const pctTotal = allocations.reduce((s, a) => s + a.percentage, 0);
  const pctBadge = document.getElementById('budget-pct-total-badge');
  if (pctBadge) {
    pctBadge.textContent = `${pctTotal}%`;
    pctBadge.className = `badge ${pctTotal === 100 ? 'badge-success' : 'badge-danger'}`;
  }

  // Render table rows
  const tbody = document.getElementById('budget-table-body');
  if (!tbody) return;

  tbody.innerHTML = rows.map(row => {
    const barColor = row.status === '🟢' ? 'var(--color-success)'
      : row.status === '🟡' ? 'var(--color-warning)'
        : 'var(--color-danger)';
    const clampedPct = Math.min(row.pctUsed, 100);
    const remClass = row.remaining < 0 ? 'danger' : '';
    const statusLabel = row.status === '🟢' ? 'On track' : row.status === '🟡' ? 'Warning' : 'Over budget';
    const tagClass = row.expCat ? '' : ' muted';
    const tagText  = row.expCat ? row.expCat.map(escapeHtml).join(' + ') : 'Reserved';

    return `
      <div class="budget-row" data-key="${escapeHtml(row.key)}">
        <div class="budget-row-main">
          <div class="btc-cat">
            <span class="budget-cat-name">${escapeHtml(row.label)}</span>
            <span class="budget-cat-tag${tagClass}">${tagText}</span>
          </div>
          <div class="btc-pct">
            <div class="budget-pct-wrap">
              <input
                type="number"
                class="budget-pct-input"
                data-key="${escapeHtml(row.key)}"
                value="${row.percentage}"
                min="0" max="100" step="1"
                aria-label="${escapeHtml(row.label)} allocation percentage"
              />
              <span class="budget-pct-sym" aria-hidden="true">%</span>
            </div>
          </div>
          <div class="btc-bud">${salary > 0 ? formatFullAmount(row.budget) : '—'}</div>
          <div class="btc-spent">${formatFullAmount(row.spent)}</div>
          <div class="btc-rem ${remClass}">${salary > 0 ? formatFullAmount(row.remaining) : '—'}</div>
          <div class="btc-sts" role="img" aria-label="${statusLabel}">${row.status}</div>
        </div>
        <div class="budget-progress-wrap" aria-hidden="true">
          <div class="budget-progress-fill"
            style="width:${clampedPct}%;background:${barColor}"
          ></div>
        </div>
      </div>`;
  }).join('');

  // Attach live-validation listeners to percentage inputs
  tbody.querySelectorAll('.budget-pct-input').forEach(input => {
    input.addEventListener('input', handleBudgetPctChange);
  });
}

/** Live-updates the total % badge and error bar as inputs change. */
function handleBudgetPctChange() {
  const inputs = document.querySelectorAll('.budget-pct-input');
  let total = 0;
  inputs.forEach(inp => { total += parseFloat(inp.value) || 0; });

  const pctBadge = document.getElementById('budget-pct-total-badge');
  if (pctBadge) {
    const display = Math.round(total * 10) / 10;
    pctBadge.textContent = `${display}%`;
    pctBadge.className = `badge ${Math.abs(total - 100) < 0.01 ? 'badge-success' : 'badge-danger'}`;
  }

  const errorBar = document.getElementById('budget-error-bar');
  const errorMsg = document.getElementById('budget-error-msg');
  if (errorBar && errorMsg) {
    const isValid = Math.abs(total - 100) < 0.01;
    errorBar.style.display = isValid ? 'none' : 'flex';
    if (!isValid) {
      const diff = Math.round((total - 100) * 10) / 10;
      errorMsg.textContent = `Total is ${Math.round(total * 10) / 10}% — ${diff > 0
        ? `reduce by ${diff}%` : `add ${Math.abs(diff)}%`} to reach 100%.`;
    }
  }
}

/** Validates, saves, and re-renders the budget allocations. */
function saveBudgetAllocations() {
  const inputs = document.querySelectorAll('.budget-pct-input');
  const saved = getBudgetAllocations();
  let total = 0;

  inputs.forEach(inp => {
    const key = inp.dataset.key;
    const val = parseFloat(inp.value) || 0;
    total += val;
    const alloc = saved.find(a => a.key === key);
    if (alloc) alloc.percentage = val;
  });

  if (Math.abs(total - 100) >= 0.01) {
    showToast(`Percentages total ${Math.round(total * 10) / 10}% — must be exactly 100%.`, 'warning');
    return;
  }

  appData.settings.budgetAllocations = saved;
  syncSettings();
  showToast('Budget allocations saved!', 'success');
  renderBudgetPlanner();
  if (currentView === 'dashboard') renderDashboard();
}

/** Resets allocations to the shipped defaults and re-renders. */
function resetBudgetAllocations() {
  appData.settings.budgetAllocations = null; // null = use DEFAULT_BUDGET_ALLOCATIONS
  syncSettings();

  // Clear error bar
  const errorBar = document.getElementById('budget-error-bar');
  if (errorBar) errorBar.style.display = 'none';

  showToast('Budget allocations reset to defaults.', 'success');
  renderBudgetPlanner();
}

/* ============================================================
   RENDER — DASHBOARD
   ============================================================ */

function renderDashboard() {
  const stats = calcMonthStats(currentMonthId);
  const month = appData.months[currentMonthId];
  const cur = appData.settings.currency;

  // Greeting
  document.getElementById('greeting').textContent = getGreeting();

  // Salary button
  const salaryBtn = document.getElementById('set-salary-btn');
  const salaryLbl = document.getElementById('set-salary-btn-label');
  if (month && month.salarySet && month.salary > 0) {
    salaryLbl.textContent = 'Edit Income';
  } else {
    salaryLbl.textContent = 'Set Income';
  }

  // Stats cards
  document.getElementById('stat-salary').textContent = formatFullAmount(stats.salary);
  document.getElementById('stat-salary-sub').textContent =
    month && month.salarySet ? formatMonthName(currentMonthId) : 'Tap to set salary';

  document.getElementById('stat-spent').textContent = formatFullAmount(stats.totalSpent);
  document.getElementById('stat-count').textContent = `${stats.count} transaction${stats.count !== 1 ? 's' : ''}`;

  document.getElementById('stat-remaining').textContent = formatFullAmount(stats.remaining);
  document.getElementById('stat-daily').textContent =
    stats.salary > 0
      ? `${formatCurrency(stats.dailyLimit)}/day — ${stats.daysRemaining} days left`
      : 'Set salary to calculate';

  document.getElementById('stat-savings').textContent = formatFullAmount(stats.savings);
  const savingsPct = stats.salary > 0
    ? Math.round((stats.savings / stats.salary) * 100)
    : 0;
  document.getElementById('stat-savings-pct').textContent = `${savingsPct}% of salary`;

  // Colour remaining card based on health
  const remainingVal = document.getElementById('stat-remaining');
  remainingVal.className = 'stat-value';
  if (stats.salary > 0) {
    if (stats.percentSpent >= 90) remainingVal.classList.add('danger');
    else if (stats.percentSpent >= 70) remainingVal.classList.add('warning');
    else remainingVal.classList.add('success');
  }

  // Progress bar
  document.getElementById('progress-subtitle').textContent = `Tracking ${formatMonthName(currentMonthId)}`;
  const pct = Math.round(stats.percentSpent);
  const fill = document.getElementById('progress-fill');
  fill.style.width = `${clamp(pct, 0, 100)}%`;
  fill.className = 'progress-fill' + (pct >= 90 ? ' danger' : pct >= 70 ? ' warning' : '');
  document.getElementById('progress-track').setAttribute('aria-valuenow', pct);
  document.getElementById('progress-pct-badge').textContent = `${pct}% spent`;
  document.getElementById('progress-days-badge').textContent =
    `${stats.daysRemaining} day${stats.daysRemaining !== 1 ? 's' : ''} left`;
  document.getElementById('progress-elapsed-text').textContent =
    `Day ${stats.dayOfMonth} of ${stats.daysInMonth}`;
  document.getElementById('progress-daily-text').textContent =
    `Daily limit: ${formatFullAmount(stats.dailyLimit)}`;

  // Top Categories mini
  const topCatList = document.getElementById('top-cats-list');
  const topCatEmpty = document.getElementById('top-cats-empty');
  const catTotals = calcCategoryTotals(currentMonthId);
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (sortedCats.length === 0) {
    topCatList.innerHTML = '';
    topCatEmpty.style.display = 'flex';
  } else {
    topCatEmpty.style.display = 'none';
    const maxCat = sortedCats[0][1];
    topCatList.innerHTML = sortedCats.map(([cat, amt]) => {
      const meta = getCatMeta(cat);
      const barW = maxCat > 0 ? (amt / maxCat) * 100 : 0;
      return `
        <div class="mini-item">
          <div class="mini-item-left">
            <span class="mini-cat-dot" style="background:${meta.color}" aria-hidden="true"></span>
            <div>
              <div class="mini-item-name">${escapeHtml(cat)}</div>
              <div class="mini-item-sub" style="width:${barW}%;height:3px;background:${meta.color};border-radius:9999px;margin-top:3px"></div>
            </div>
          </div>
          <span class="mini-item-amount">${formatCurrency(amt)}</span>
        </div>`;
    }).join('');
  }

  // Budget summary cards (two new cards below the main stats)
  renderDashboardBudgetCards();

  // Recent expenses
  const recentList = document.getElementById('recent-list');
  const recentEmpty = document.getElementById('recent-empty');
  const allExps = month ? [...(month.expenses || [])].sort((a, b) => b.date.localeCompare(a.date)) : [];
  const recentExps = allExps.slice(0, 5);

  if (recentExps.length === 0) {
    recentList.innerHTML = '';
    recentEmpty.style.display = 'flex';
  } else {
    recentEmpty.style.display = 'none';
    recentList.innerHTML = recentExps.map(e => buildExpenseItemHtml(e, true)).join('');
    attachExpenseItemEvents(recentList);
  }
}

/* ============================================================
   RENDER — EXPENSES VIEW
   ============================================================ */

function renderExpenses() {
  const month = appData.months[currentMonthId];
  const allExpenses = month ? [...(month.expenses || [])] : [];

  // Sort by date (direction controlled by expenseSortDir)
  allExpenses.sort((a, b) => {
    const dateCmp = expenseSortDir === 'desc'
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return expenseSortDir === 'desc'
      ? b.timestamp - a.timestamp
      : a.timestamp - b.timestamp;
  });

  // Sync sort button label + icon
  const sortBtn   = document.getElementById('sort-date-btn');
  const sortLabel = document.getElementById('sort-date-label');
  const sortIcon  = sortBtn?.querySelector('.material-symbols-rounded');
  if (sortLabel) sortLabel.textContent = expenseSortDir === 'desc' ? 'Newest' : 'Oldest';
  if (sortIcon)  sortIcon.textContent  = expenseSortDir === 'desc' ? 'arrow_downward' : 'arrow_upward';

  const filtered = filterExpenses(
    allExpenses, activeTimeFilter, customRangeFrom, customRangeTo, activeCatFilter, searchQuery
  );

  // Category chips
  renderCategoryChips();

  // Stats bar
  const total = filtered.reduce((s, e) => s + e.amount, 0);
  document.getElementById('results-count').textContent =
    `${filtered.length} expense${filtered.length !== 1 ? 's' : ''}`;
  document.getElementById('results-total').textContent = `Total: ${formatFullAmount(total)}`;

  const container = document.getElementById('expenses-container');
  const emptyEl = document.getElementById('expenses-empty');

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';

  const groups = groupExpensesByDate(filtered, expenseSortDir);
  container.innerHTML = groups.map(({ date, expenses }) => {
    const groupTotal = expenses.reduce((s, e) => s + e.amount, 0);
    const dateLabel = buildDateLabel(date);
    return `
      <div class="expense-group">
        <div class="expense-group-header">
          <span class="expense-group-date">${dateLabel}</span>
          <span class="expense-group-total">${formatCurrency(groupTotal)}</span>
        </div>
        <div class="expense-group-items">
          ${expenses.map(e => buildExpenseItemHtml(e, false)).join('')}
        </div>
      </div>`;
  }).join('');

  attachExpenseItemEvents(container);
}

function buildDateLabel(dateStr) {
  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return formatDate(dateStr);
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildExpenseItemHtml(e, compact) {
  const meta = getCatMeta(e.category);
  const noteTag = e.note && !compact
    ? `<span class="expense-note-label">${escapeHtml(e.note)}</span>`
    : '';
  return `
    <div class="expense-item" data-id="${escapeHtml(e.id)}">
      <div class="expense-cat-icon" style="background:${meta.color}18;color:${meta.color}" aria-hidden="true">
        <span class="material-symbols-rounded">${meta.icon}</span>
      </div>
      <div class="expense-details">
        <div class="expense-name">${escapeHtml(e.name)}</div>
        <div class="expense-meta">
          <span class="expense-cat-label">${escapeHtml(e.category)}</span>
          <span class="expense-dot" aria-hidden="true"></span>
          <span class="expense-date-label">${compact ? formatDateShort(e.date) : formatDate(e.date)}</span>
          <span class="expense-mode-badge ${(e.mode || 'Cash') === 'Cash' ? 'cash' : ''}">${escapeHtml(e.mode || 'Cash')}</span>
          ${noteTag}
        </div>
      </div>
      <div class="expense-right">
        <div class="expense-amount">${formatCurrency(e.amount)}</div>
        <div class="expense-actions">
          <button class="icon-btn" data-action="edit" data-id="${escapeHtml(e.id)}" aria-label="Edit expense ${escapeHtml(e.name)}">
            <span class="material-symbols-rounded">edit</span>
          </button>
          <button class="icon-btn danger" data-action="delete" data-id="${escapeHtml(e.id)}" aria-label="Delete expense ${escapeHtml(e.name)}">
            <span class="material-symbols-rounded">delete</span>
          </button>
        </div>
      </div>
    </div>`;
}

function attachExpenseItemEvents(container) {
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === 'edit') openEditExpenseModal(id);
      if (action === 'delete') openDeleteExpenseModal(id);
    });
  });
}

function renderCategoryChips() {
  const bar = document.getElementById('cat-chips-bar');
  if (!bar) return;
  const sorted = [...appData.categories].sort((a, b) => a.localeCompare(b));
  const cats = ['all', ...sorted];
  bar.innerHTML = cats.map(cat => {
    const meta = cat === 'all' ? null : getCatMeta(cat);
    const isActive = activeCatFilter === cat;
    const color = meta?.color || '#64748B';
    const icon = meta?.icon || 'category';
    const bgStyle = isActive
      ? (cat === 'all'
          ? `background:var(--color-primary);border-color:var(--color-primary)`
          : `background:${color};border-color:${color}`)
      : '';
    const iconHtml = cat === 'all'
      ? `<span class="material-symbols-rounded">apps</span>`
      : `<span class="material-symbols-rounded">${icon}</span>`;
    return `<button class="cat-chip${isActive ? ' active' : ''}" data-cat="${escapeHtml(cat)}" style="${bgStyle}" aria-pressed="${isActive}">${iconHtml} ${cat === 'all' ? 'All' : escapeHtml(cat)}</button>`;
  }).join('');

  bar.querySelectorAll('.cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeCatFilter = chip.dataset.cat;
      renderExpenses();
    });
  });
}

/* ============================================================
   RENDER — ANALYTICS VIEW
   ============================================================ */

function renderAnalytics() {
  // Populate month selector
  const sel = document.getElementById('analytics-month-select');
  const months = getAllMonths();
  if (months.length === 0) {
    ensureMonth(currentMonthId);
    months.push(appData.months[currentMonthId]);
  }
  sel.innerHTML = months.map(m => `
    <option value="${escapeHtml(m.id)}" ${m.id === analyticsMonthId ? 'selected' : ''}>
      ${formatMonthName(m.id)}
    </option>`).join('');

  const month = appData.months[analyticsMonthId];
  const exps = month ? (month.expenses || []) : [];
  const stats = calcMonthStats(analyticsMonthId);

  // Summary metrics
  document.getElementById('an-spent').textContent = formatFullAmount(stats.totalSpent);
  document.getElementById('an-count').textContent = exps.length;
  const daysElapsed = month
    ? (analyticsMonthId === currentMonthId ? getDayOfMonth() : getDaysInMonth(month.year, month.month))
    : 1;
  document.getElementById('an-avg').textContent =
    formatCurrency(daysElapsed > 0 ? stats.totalSpent / daysElapsed : 0);
  const largest = exps.length > 0 ? Math.max(...exps.map(e => e.amount)) : 0;
  document.getElementById('an-largest').textContent = formatCurrency(largest);
  const pct = stats.salary > 0 ? Math.round((stats.totalSpent / stats.salary) * 100) : 0;
  document.getElementById('an-pct').textContent = `${pct}%`;

  // Charts
  renderBarChart();
  renderDonutChart();
  renderLineChart();

  // Category breakdown table
  renderCategoryTable();
}

function renderCategoryTable() {
  const catTotals = calcCategoryTotals(analyticsMonthId);
  const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const table = document.getElementById('cat-breakdown-table');
  const emptyEl = document.getElementById('cat-table-empty');
  const totalSpent = Object.values(catTotals).reduce((s, v) => s + v, 0);

  if (sorted.length === 0) {
    table.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';
  const maxAmt = sorted[0][1];

  table.innerHTML = sorted.map(([cat, amt]) => {
    const meta = getCatMeta(cat);
    const barPct = maxAmt > 0 ? (amt / maxAmt) * 100 : 0;
    const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
    return `
      <div class="cat-table-row">
        <div class="cat-table-name">
          <span class="cat-table-dot" style="background:${meta.color}" aria-hidden="true"></span>
          ${escapeHtml(cat)}
        </div>
        <div class="cat-table-bar-wrap">
          <div class="cat-table-bar-fill" style="width:${barPct}%;background:${meta.color}"></div>
        </div>
        <div class="cat-table-amount">${formatCurrency(amt)}</div>
        <div class="cat-table-pct">${pct}%</div>
      </div>`;
  }).join('');
}

/* ============================================================
   CHARTS — CANVAS
   ============================================================ */

function getCanvasCtx(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = (canvas.classList.contains('donut') ? rect.width : rect.height || 220) * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = canvas.classList.contains('donut') ? `${rect.width}px` : `${rect.height || 220}px`;
  return { ctx, width: rect.width, height: canvas.classList.contains('donut') ? rect.width : (rect.height || 220) };
}

function getChartTextColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--text-3').trim() || '#94A3B8';
}

function getChartBorderColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#E2E8F0';
}

function renderBarChart() {
  const cv = getCanvasCtx('bar-chart');
  if (!cv) return;
  const { ctx, width, height } = cv;

  const months = getLastNMonths(6);
  const labels = months.map(m => formatMonthShort(m));
  const values = months.map(m => {
    const mo = appData.months[m];
    return mo ? (mo.expenses || []).reduce((s, e) => s + e.amount, 0) : 0;
  });
  const maxVal = Math.max(...values, 1);
  const textColor = getChartTextColor();
  const borderColor = getChartBorderColor();

  const padL = 55, padR = 16, padT = 16, padB = 48;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const barW = Math.max(10, (chartW / months.length) - 10);
  const gap = (chartW - barW * months.length) / (months.length + 1);

  ctx.clearRect(0, 0, width, height);

  // Y-axis gridlines
  const steps = 4;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = textColor;

  for (let i = 0; i <= steps; i++) {
    const y = padT + chartH - (i / steps) * chartH;
    const v = (maxVal / steps) * i;
    ctx.fillStyle = textColor;
    ctx.fillText(formatCurrency(v), padL - 6, y);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Bars
  months.forEach((m, i) => {
    const x = padL + gap + i * (barW + gap);
    const barH = values[i] > 0 ? (values[i] / maxVal) * chartH : 0;
    const y = padT + chartH - barH;

    const isCurrent = m === currentMonthId;
    const grad = ctx.createLinearGradient(0, y, 0, padT + chartH);
    grad.addColorStop(0, isCurrent ? '#2563EB' : '#3B82F6');
    grad.addColorStop(1, isCurrent ? '#1D4ED8' : '#93C5FD');

    // Bar
    const radius = Math.min(6, barW / 2);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + barW - radius, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
    ctx.lineTo(x + barW, padT + chartH);
    ctx.lineTo(x, padT + chartH);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    // Hover-style highlight if current
    if (isCurrent) {
      ctx.fillStyle = 'rgba(37,99,235,0.08)';
      ctx.fillRect(x - 4, padT, barW + 8, chartH);
    }

    // X label
    ctx.fillStyle = isCurrent ? '#2563EB' : textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = isCurrent ? 'bold 11px Inter, sans-serif' : '11px Inter, sans-serif';
    ctx.fillText(labels[i], x + barW / 2, padT + chartH + 10);
  });
}

function renderDonutChart() {
  const canvas = document.getElementById('donut-chart');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const size = 180;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const catTotals = calcCategoryTotals(analyticsMonthId);
  const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const total = Object.values(catTotals).reduce((s, v) => s + v, 0);

  const legend = document.getElementById('donut-legend');

  if (sorted.length === 0 || total === 0) {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = getChartBorderColor();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 30, 0, Math.PI * 2);
    ctx.fill();
    if (legend) legend.innerHTML = '<div style="color:var(--text-3);font-size:12px">No data</div>';
    return;
  }

  let startAngle = -Math.PI / 2;
  const cx = size / 2, cy = size / 2, outerR = size / 2 - 6, innerR = size / 2 - 32;

  sorted.forEach(([cat, amt], i) => {
    const slice = (amt / total) * Math.PI * 2;
    const meta = getCatMeta(cat);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = meta.color;
    ctx.fill();
    startAngle += slice;
  });

  // Inner circle (donut hole)
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#fff';
  ctx.fill();

  // Center text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#0F172A';
  ctx.font = `bold 13px Inter, sans-serif`;
  ctx.fillText(formatCurrency(total), cx, cy - 6);
  ctx.fillStyle = getChartTextColor();
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText('spent', cx, cy + 8);

  // Legend
  if (legend) {
    legend.innerHTML = sorted.slice(0, 8).map(([cat, amt]) => {
      const meta = getCatMeta(cat);
      const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
      return `
        <div class="donut-legend-item">
          <span class="donut-legend-dot" style="background:${meta.color}" aria-hidden="true"></span>
          <span class="donut-legend-name">${escapeHtml(cat)}</span>
          <span class="donut-legend-pct">${pct}%</span>
        </div>`;
    }).join('');
  }
}

function renderLineChart() {
  const cv = getCanvasCtx('line-chart');
  if (!cv) return;
  const { ctx, width, height } = cv;

  const months = getLastNMonths(6);
  const labels = months.map(m => formatMonthShort(m));
  const values = months.map(m => {
    const mo = appData.months[m];
    if (!mo) return 0;
    const salary = mo.salary || 0;
    const spent = (mo.expenses || []).reduce((s, e) => s + e.amount, 0);
    return salary - spent;
  });

  const maxVal = Math.max(...values.map(Math.abs), 1);
  const minVal = Math.min(...values, 0);
  const range = Math.max(maxVal - minVal, 1);
  const textColor = getChartTextColor();
  const borderColor = getChartBorderColor();

  const padL = 60, padR = 20, padT = 20, padB = 48;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const pointGap = chartW / (months.length - 1 || 1);

  ctx.clearRect(0, 0, width, height);

  function getX(i) { return padL + i * pointGap; }
  function getY(v) { return padT + chartH - ((v - minVal) / range) * chartH; }

  // Zero line
  if (minVal < 0) {
    const zeroY = getY(0);
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(padL, zeroY); ctx.lineTo(padL + chartW, zeroY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#EF444480';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.fillText('0', padL - 4, zeroY);
  }

  // Y-axis gridlines
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const v = minVal + (range / steps) * i;
    const y = getY(v);
    ctx.fillStyle = textColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(formatCurrency(v), padL - 6, y);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Fill area
  const areaGrad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
  areaGrad.addColorStop(0, 'rgba(34,197,94,0.18)');
  areaGrad.addColorStop(1, 'rgba(34,197,94,0.01)');

  ctx.beginPath();
  ctx.moveTo(getX(0), getY(values[0]));
  months.forEach((_, i) => { if (i > 0) ctx.lineTo(getX(i), getY(values[i])); });
  ctx.lineTo(getX(months.length - 1), padT + chartH);
  ctx.lineTo(getX(0), padT + chartH);
  ctx.closePath();
  ctx.fillStyle = areaGrad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#22C55E';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  months.forEach((_, i) => {
    if (i === 0) ctx.moveTo(getX(i), getY(values[i]));
    else ctx.lineTo(getX(i), getY(values[i]));
  });
  ctx.stroke();

  // Points
  months.forEach((m, i) => {
    const x = getX(i), y = getY(values[i]);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = values[i] >= 0 ? '#22C55E' : '#EF4444';
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#fff';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Value label above point
    ctx.fillStyle = values[i] >= 0 ? '#22C55E' : '#EF4444';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText(formatCurrency(values[i]), x, y - 8);

    // X label
    const isCurrent = m === currentMonthId;
    ctx.fillStyle = isCurrent ? '#2563EB' : textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = isCurrent ? 'bold 11px Inter, sans-serif' : '11px Inter, sans-serif';
    ctx.fillText(labels[i], x, padT + chartH + 10);
  });
}

/* ============================================================
   RENDER — HISTORY VIEW
   ============================================================ */

function renderHistory() {
  const grid = document.getElementById('history-grid');
  const emptyEl = document.getElementById('history-empty');
  const months = getAllMonths();

  if (months.length === 0) {
    grid.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';

  grid.innerHTML = months.map(m => {
    const stats = calcMonthStats(m.id);
    const pct = stats.salary > 0 ? clamp(Math.round(stats.percentSpent), 0, 100) : 0;
    const isCur = m.id === currentMonthId;
    const barColor = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#2563EB';

    return `
      <div class="history-month-card${isCur ? ' current-month' : ''}"
        tabindex="0"
        role="button"
        aria-label="View ${formatMonthName(m.id)} — Spent ${formatCurrency(stats.totalSpent)}"
        data-month="${escapeHtml(m.id)}"
      >
        <div class="hmc-header">
          <div class="hmc-month-name">${formatMonthName(m.id)}</div>
          ${isCur ? '<span class="hmc-current-badge">Current</span>' : ''}
        </div>
        <div class="hmc-stats">
          <div class="hmc-stat">
            <div class="hmc-stat-label">Salary</div>
            <div class="hmc-stat-value">${stats.salary > 0 ? formatCurrency(stats.salary) : '—'}</div>
          </div>
          <div class="hmc-stat">
            <div class="hmc-stat-label">Spent</div>
            <div class="hmc-stat-value danger">${formatCurrency(stats.totalSpent)}</div>
          </div>
          <div class="hmc-stat">
            <div class="hmc-stat-label">Remaining</div>
            <div class="hmc-stat-value${stats.savings >= 0 ? ' success' : ' danger'}">${formatCurrency(Math.abs(stats.remaining))}</div>
          </div>
          <div class="hmc-stat">
            <div class="hmc-stat-label">Transactions</div>
            <div class="hmc-stat-value">${stats.count}</div>
          </div>
        </div>
        <div class="hmc-progress">
          <div class="hmc-progress-fill" style="width:${pct}%;background:${barColor}"></div>
        </div>
        <div class="hmc-footer">
          <span class="hmc-count">${pct}% of salary spent</span>
          <span class="material-symbols-rounded hmc-arrow" aria-hidden="true">arrow_forward</span>
        </div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.history-month-card').forEach(card => {
    const activate = () => {
      const monthId = card.dataset.month;
      if (monthId) {
        currentMonthId = monthId;
        navigateTo('expenses');
        showToast(`Viewing ${formatMonthName(monthId)}`, 'info', 2000);
      }
    };
    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });
}

/* ============================================================
   RENDER — SETTINGS VIEW
   ============================================================ */

function renderSettings() {
  // Dark mode toggle
  const darkToggle = document.getElementById('settings-dark-toggle');
  if (darkToggle) darkToggle.checked = appData.settings.darkMode;

  // Currency
  const curSel = document.getElementById('settings-currency');
  if (curSel) curSel.value = appData.settings.currency || '₹';

  // Default salary
  const defSal = document.getElementById('settings-default-salary');
  if (defSal) defSal.value = appData.settings.defaultSalary || '';

  // Categories
  renderSettingsCategoryList();
  renderCatPicker();
}

function renderCatPicker() {
  const iconGrid = document.getElementById('cat-icon-grid');
  const colorPalette = document.getElementById('cat-color-palette');
  if (!iconGrid || !colorPalette) return;

  iconGrid.innerHTML = ICON_PICKER_OPTIONS.map(icon => `
    <button type="button" class="cat-icon-btn${icon === newCatIcon ? ' active' : ''}" data-icon="${icon}" title="${icon}" aria-label="${icon}">
      <span class="material-symbols-rounded" style="font-size:18px">${icon}</span>
    </button>`).join('');

  colorPalette.innerHTML = COLOR_PALETTE.map(color => `
    <button type="button" class="cat-color-swatch${color === newCatColor ? ' active' : ''}"
      data-color="${color}" style="background:${color}" aria-label="Color ${color}">
    </button>`).join('');

  iconGrid.querySelectorAll('.cat-icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      newCatIcon = btn.dataset.icon;
      iconGrid.querySelectorAll('.cat-icon-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateCatPickerPreview();
    });
  });

  colorPalette.querySelectorAll('.cat-color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      newCatColor = sw.dataset.color;
      colorPalette.querySelectorAll('.cat-color-swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      updateCatPickerPreview();
    });
  });

  updateCatPickerPreview();
}

function updateCatPickerPreview() {
  const nameEl = document.getElementById('cat-preview-name');
  const iconWrap = document.getElementById('cat-preview-icon');
  const nameInput = document.getElementById('new-cat-input');
  if (nameEl) nameEl.textContent = nameInput?.value.trim() || 'Category name';
  if (iconWrap) {
    iconWrap.style.background = newCatColor + '20';
    iconWrap.style.color = newCatColor;
    const span = iconWrap.querySelector('.material-symbols-rounded');
    if (span) span.textContent = newCatIcon;
  }
}


function renderSettingsCategoryList() {
  const list = document.getElementById('settings-cat-list');
  if (!list) return;
  list.innerHTML = appData.categories.map(cat => {
    const isDefault = DEFAULT_CATEGORIES.includes(cat);
    const isEditing = cat === editingCatName;
    const deleteBtn = !isDefault
      ? `<button class="cat-delete-btn" data-cat="${escapeHtml(cat)}" aria-label="Delete category ${escapeHtml(cat)}">
           <span class="material-symbols-rounded">close</span>
         </button>`
      : '';
    return `
      <span class="cat-settings-chip${!isDefault ? ' custom' : ''}${isEditing ? ' editing' : ''}">
        ${escapeHtml(cat)}
        <button class="cat-edit-btn" data-cat="${escapeHtml(cat)}" aria-label="Edit category ${escapeHtml(cat)}">
          <span class="material-symbols-rounded">edit</span>
        </button>
        ${deleteBtn}
      </span>`;
  }).join('');

  list.querySelectorAll('.cat-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => startEditCategory(btn.dataset.cat));
  });
  list.querySelectorAll('.cat-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteCategory(btn.dataset.cat));
  });
}

function startEditCategory(cat) {
  editingCatName = cat;
  const isDefault = DEFAULT_CATEGORIES.includes(cat);
  const input = document.getElementById('new-cat-input');
  if (input) {
    input.value = cat;
    input.disabled = isDefault;
    input.placeholder = isDefault ? 'Default — name cannot be changed' : 'Category name';
  }
  const meta = getCatMeta(cat);
  newCatIcon = meta.icon;
  newCatColor = meta.color;
  renderCatPicker();

  const addBtn = document.getElementById('add-cat-btn');
  if (addBtn) addBtn.textContent = 'Update';
  const cancelBtn = document.getElementById('cancel-cat-edit-btn');
  if (cancelBtn) cancelBtn.style.display = 'inline-flex';

  renderSettingsCategoryList();
  input?.focus();
}

function cancelEditCategory() {
  editingCatName = null;
  newCatIcon = 'category';
  newCatColor = '#64748B';
  const input = document.getElementById('new-cat-input');
  if (input) { input.value = ''; input.disabled = false; input.placeholder = 'New category name'; }
  const addBtn = document.getElementById('add-cat-btn');
  if (addBtn) addBtn.textContent = 'Add';
  const cancelBtn = document.getElementById('cancel-cat-edit-btn');
  if (cancelBtn) cancelBtn.style.display = 'none';
  renderCatPicker();
  renderSettingsCategoryList();
}

function updateCategory() {
  if (!editingCatName) return;
  const isDefault = DEFAULT_CATEGORIES.includes(editingCatName);
  const input = document.getElementById('new-cat-input');
  const newName = (!isDefault && input?.value.trim()) ? input.value.trim() : editingCatName;

  if (!isDefault && newName !== editingCatName) {
    if (newName.length > 30) { showToast('Category name too long (max 30 chars).', 'warning'); return; }
    if (appData.categories.some(c => c.toLowerCase() === newName.toLowerCase() && c !== editingCatName)) {
      showToast('Category already exists.', 'warning'); return;
    }
    const idx = appData.categories.indexOf(editingCatName);
    if (idx !== -1) appData.categories[idx] = newName;
    if (appData.settings.customCategoryMeta?.[editingCatName]) {
      appData.settings.customCategoryMeta[newName] = appData.settings.customCategoryMeta[editingCatName];
      delete appData.settings.customCategoryMeta[editingCatName];
    }
    Object.values(appData.months).forEach(m => {
      (m.expenses || []).forEach(e => {
        if (e.category === editingCatName) {
          e.category = newName;
          syncUpdateExpense(e);
        }
      });
    });
  }

  if (!appData.settings.customCategoryMeta) appData.settings.customCategoryMeta = {};
  appData.settings.customCategoryMeta[newName] = { icon: newCatIcon, color: newCatColor };

  syncSettings();
  showToast(`"${newName}" updated!`, 'success');
  cancelEditCategory();
  refreshCurrentView();
}

function updateSidebarMonthLabel() {
  const lbl = document.getElementById('sidebar-month-label');
  if (lbl) lbl.textContent = formatMonthName(currentMonthId);
  updateMonthNav();
}

function updateMonthNav() {
  const label = formatMonthName(currentMonthId);
  const el = document.getElementById('month-nav-label');
  if (el) el.textContent = label;
}

function navigateMonth(delta) {
  const [y, m] = currentMonthId.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  currentMonthId = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  ensureMonth(currentMonthId);
  updateSidebarMonthLabel();
  refreshCurrentView();
}

/* ============================================================
   EXPENSE MODAL — ADD / EDIT
   ============================================================ */

function setModeToggle(mode) {
  const val = mode || 'Cash';
  document.getElementById('exp-mode').value = val;
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === val);
  });
}

function openAddExpenseModal() {
  editingExpenseId = null;
  document.getElementById('expense-modal-title').textContent = 'Add Expense';
  document.getElementById('expense-save-btn').textContent = 'Submit Expense';

  const form = document.getElementById('expense-form');
  form.reset();
  populateCategorySelects();
  setModeToggle('GPay');

  const dateInput = document.getElementById('exp-date');
  const today = getTodayStr();
  const todayMonth = today.slice(0, 7);
  if (currentMonthId === todayMonth) {
    dateInput.value = today;
  } else if (currentMonthId < todayMonth) {
    const [y, m] = currentMonthId.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    dateInput.value = `${currentMonthId}-${String(lastDay).padStart(2, '0')}`;
  } else {
    dateInput.value = `${currentMonthId}-01`;
  }
  document.getElementById('exp-amount-prefix').textContent = appData.settings.currency || '₹';
  document.getElementById('expense-add-another-btn').style.display = 'inline-flex';

  openModal('modal-expense');
}

function openEditExpenseModal(expenseId) {
  const month = appData.months[currentMonthId];
  if (!month) return;
  const expense = (month.expenses || []).find(e => e.id === expenseId);
  if (!expense) return;

  editingExpenseId = expenseId;
  document.getElementById('expense-modal-title').textContent = 'Edit Expense';
  document.getElementById('expense-save-btn').textContent = 'Save Changes';
  document.getElementById('expense-add-another-btn').style.display = 'none';

  populateCategorySelects();
  document.getElementById('exp-name').value = expense.name;
  document.getElementById('exp-amount').value = formatAmountInput(String(expense.amount));
  document.getElementById('exp-category').value = expense.category;
  document.getElementById('exp-date').value = expense.date;
  document.getElementById('exp-note').value = expense.note || '';
  document.getElementById('exp-amount-prefix').textContent = appData.settings.currency || '₹';
  setModeToggle(expense.mode || 'Cash');

  openModal('modal-expense');
}

function populateCategorySelects() {
  const sel = document.getElementById('exp-category');
  if (!sel) return;
  const options = [...appData.categories].sort((a, b) => a.localeCompare(b)).map(cat =>
    `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`
  ).join('');
  sel.innerHTML = `<option value="" disabled selected>Select category</option>` + options;
}

function handleExpenseFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('exp-name').value.trim();
  const amount = parseAmountInput(document.getElementById('exp-amount').value);
  const category = document.getElementById('exp-category').value;
  const date = document.getElementById('exp-date').value;
  const note = document.getElementById('exp-note').value.trim();
  const mode = document.getElementById('exp-mode').value || 'Cash';

  if (!name) { showToast('Please enter a name.', 'warning'); return; }
  if (isNaN(amount) || amount < 0) { showToast('Please enter a valid amount.', 'warning'); return; }
  if (!category) { showToast('Please select a category.', 'warning'); return; }
  if (!date) { showToast('Please select a date.', 'warning'); return; }
  if (date.slice(0, 7) !== currentMonthId) {
    showToast(`Date must be within ${formatMonthName(currentMonthId)}.`, 'warning'); return;
  }

  const month = appData.months[currentMonthId];
  if (!month) { showToast('Month data not found.', 'error'); return; }

  if (editingExpenseId) {
    const idx = (month.expenses || []).findIndex(e => e.id === editingExpenseId);
    if (idx !== -1) {
      month.expenses[idx] = { ...month.expenses[idx], name, amount, category, date, note, mode };
      syncUpdateExpense(month.expenses[idx]);
      showToast('Expense updated!', 'success');
    }
  } else {
    const newExp = {
      id: generateId('exp'),
      name, amount, category, date, note, mode,
      timestamp: Date.now(),
    };
    month.expenses.push(newExp);
    syncInsertExpense(currentMonthId, newExp);
    showToast('Expense added!', 'success');
  }
  closeModal('modal-expense');
  refreshCurrentView();
  if (!editingExpenseId && (!month.salarySet || !month.salary)) {
    setTimeout(() => openSalaryModal(), 300);
  }
}

function handleAddAnother() {
  const name = document.getElementById('exp-name').value.trim();
  const amount = parseAmountInput(document.getElementById('exp-amount').value);
  const category = document.getElementById('exp-category').value;
  const date = document.getElementById('exp-date').value;
  const note = document.getElementById('exp-note').value.trim();
  const mode = document.getElementById('exp-mode').value || 'Cash';

  if (!name) { showToast('Please enter a name.', 'warning'); return; }
  if (isNaN(amount) || amount <= 0) { showToast('Please enter a valid amount.', 'warning'); return; }
  if (!category) { showToast('Please select a category.', 'warning'); return; }
  if (!date) { showToast('Please select a date.', 'warning'); return; }
  if (date.slice(0, 7) !== currentMonthId) {
    showToast(`Date must be within ${formatMonthName(currentMonthId)}.`, 'warning'); return;
  }

  const month = appData.months[currentMonthId];
  if (!month) { showToast('Month data not found.', 'error'); return; }

  const newExp = {
    id: generateId('exp'),
    name, amount, category, date, note, mode,
    timestamp: Date.now(),
  };
  month.expenses.push(newExp);
  syncInsertExpense(currentMonthId, newExp);
  showToast('Expense added!', 'success');

  // Reset only name, amount, note — keep date, category, mode for convenience
  document.getElementById('exp-name').value = '';
  document.getElementById('exp-amount').value = '';
  document.getElementById('exp-note').value = '';
  document.getElementById('exp-name').focus();

  refreshCurrentView();
}

/* ============================================================
   DELETE EXPENSE MODAL
   ============================================================ */

function openDeleteExpenseModal(expenseId) {
  const month = appData.months[currentMonthId];
  if (!month) return;
  const expense = (month.expenses || []).find(e => e.id === expenseId);
  if (!expense) return;

  deleteTarget = expenseId;
  deleteContext = 'expense';
  document.getElementById('delete-modal-body').textContent =
    `Delete "${expense.name}" (${formatCurrency(expense.amount)})? This cannot be undone.`;
  openModal('modal-delete');
}

function handleDeleteConfirm() {
  if (deleteContext === 'expense') {
    const month = appData.months[currentMonthId];
    if (month) {
      month.expenses = (month.expenses || []).filter(e => e.id !== deleteTarget);
      syncDeleteExpense(deleteTarget);
      showToast('Expense deleted.', 'success');
      refreshCurrentView();
    }
  }
  deleteTarget = null;
  deleteContext = null;
  closeModal('modal-delete');
}

/* ============================================================
   SALARY MODAL
   ============================================================ */

function openSalaryModal() {
  document.getElementById('salary-modal-month').textContent = formatMonthName(currentMonthId);
  document.getElementById('salary-prefix').textContent = appData.settings.currency || '₹';
  const month = appData.months[currentMonthId];
  const input = document.getElementById('salary-input');
  input.value = (month && month.salary) ? month.salary : (appData.settings.defaultSalary || '');
  openModal('modal-salary');
}

function handleSalarySave() {
  const val = parseFloat(document.getElementById('salary-input').value);
  if (isNaN(val) || val < 0) { showToast('Enter a valid salary.', 'warning'); return; }
  const month = appData.months[currentMonthId];
  month.salary = val;
  month.salarySet = true;
  syncMonth(currentMonthId);
  closeModal('modal-salary');
  showToast(`Income set to ${formatCurrency(val)} for ${formatMonthShort(currentMonthId)}`, 'success');
  refreshCurrentView();
}

/* ============================================================
   CATEGORIES
   ============================================================ */

function addCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) { showToast('Enter a category name.', 'warning'); return; }
  if (trimmed.length > 30) { showToast('Category name too long (max 30 chars).', 'warning'); return; }
  if (appData.categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
    showToast('Category already exists.', 'warning'); return;
  }
  appData.categories.push(trimmed);
  if (!appData.settings.customCategoryMeta) appData.settings.customCategoryMeta = {};
  appData.settings.customCategoryMeta[trimmed] = { icon: newCatIcon, color: newCatColor };
  syncSettings();
  renderSettingsCategoryList();
  showToast(`Category "${trimmed}" added!`, 'success');
  document.getElementById('new-cat-input').value = '';
  newCatIcon = 'category';
  newCatColor = '#64748B';
  renderCatPicker();
}

function deleteCategory(name) {
  if (DEFAULT_CATEGORIES.includes(name)) {
    showToast('Default categories cannot be deleted.', 'warning'); return;
  }
  const inUse = Object.values(appData.months).some(m =>
    (m.expenses || []).some(e => e.category === name)
  );
  if (inUse) {
    showToast(`"${name}" is used by existing expenses and cannot be deleted.`, 'warning'); return;
  }
  appData.categories = appData.categories.filter(c => c !== name);
  if (appData.settings.customCategoryMeta) delete appData.settings.customCategoryMeta[name];
  syncSettings();
  renderSettingsCategoryList();
  showToast(`Category "${name}" deleted.`, 'success');
}

/* ============================================================
   BACKUP — EXPORT / IMPORT
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

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (!parsed.months && !parsed.settings) throw new Error('Invalid format');

      const imported = {
        version: APP_VERSION,
        settings: parsed.settings || deepClone(DEFAULT_DATA.settings),
        categories: parsed.categories || [...DEFAULT_CATEGORIES],
        months: parsed.months || {},
      };
      if (imported.settings.budgetAllocations === undefined) imported.settings.budgetAllocations = null;
      DEFAULT_CATEGORIES.forEach(cat => { if (!imported.categories.includes(cat)) imported.categories.unshift(cat); });

      // Clear existing Supabase data (expenses first due to FK)
      await db.from('bgpt_expenses').delete().neq('id', '');
      await db.from('bgpt_months').delete().neq('id', '');

      // Write settings
      await db.from('bgpt_settings').upsert({
        id: 1,
        dark_mode: imported.settings.darkMode,
        currency: imported.settings.currency,
        default_salary: imported.settings.defaultSalary,
        budget_allocations: imported.settings.budgetAllocations,
        categories: imported.categories,
      });

      // Write months then expenses
      const monthRows = Object.values(imported.months).map(m => ({
        id: m.id, salary: m.salary || 0, salary_set: m.salarySet || false,
      }));
      const expenseRows = Object.values(imported.months).flatMap(m =>
        (m.expenses || []).map(e => ({
          id: e.id, month_id: m.id, name: e.name, amount: e.amount,
          category: e.category, date: e.date, note: e.note || '',
          mode: e.mode || 'Cash', timestamp: e.timestamp,
        }))
      );

      if (monthRows.length) await db.from('bgpt_months').insert(monthRows);
      if (expenseRows.length) await db.from('bgpt_expenses').insert(expenseRows);

      appData = imported;
      currentMonthId = getCurrentMonthId();
      analyticsMonthId = currentMonthId;
      applyTheme(appData.settings.darkMode);
      updateCurrencyPrefixes();
      updateSidebarMonthLabel();
      showToast('Backup imported successfully!', 'success');
      navigateTo('dashboard');
    } catch (err) {
      console.error(err);
      showToast('Invalid backup file. Please use a BrokeGPT JSON export.', 'error');
    }
  };
  reader.readAsText(file);
}

/* ============================================================
   RESET APPLICATION
   ============================================================ */

function openResetModal() {
  openModal('modal-reset');
}

async function handleResetConfirm() {
  // Clear all rows from Supabase (expenses first due to FK)
  await db.from('bgpt_expenses').delete().neq('id', '');
  await db.from('bgpt_months').delete().neq('id', '');
  await db.from('bgpt_settings').upsert({
    id: 1, dark_mode: false, currency: '₹', default_salary: 0,
    budget_allocations: null, categories: [...DEFAULT_CATEGORIES],
  });

  appData = deepClone(DEFAULT_DATA);
  currentMonthId = getCurrentMonthId();
  analyticsMonthId = currentMonthId;
  ensureMonth(currentMonthId);
  applyTheme(false);
  closeModal('modal-reset');
  showToast('Application reset. Fresh start!', 'info');
  navigateTo('dashboard');
}

/* ============================================================
   REFRESH
   ============================================================ */

function refreshCurrentView() {
  if (currentView === 'dashboard') renderDashboard();
  if (currentView === 'expenses') renderExpenses();
  if (currentView === 'analytics') renderAnalytics();
  if (currentView === 'budget') renderBudgetPlanner();
  if (currentView === 'history') renderHistory();
  if (currentView === 'settings') renderSettings();
}

/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeAllModals(); return; }

    const isTyping = e.target.matches('input, textarea, select');
    if (!isTyping && (e.ctrlKey || e.metaKey)) {
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openAddExpenseModal();
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        navigateTo('expenses');
        setTimeout(() => { const si = document.getElementById('search-input'); if (si) si.focus(); }, 100);
      }
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        toggleDarkMode();
      }
    }
  });
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */

function setupEventListeners() {

  // ── Navigation ──────────────────────────────────────────
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(item.dataset.view);
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateTo(item.dataset.view); }
    });
  });

  document.querySelectorAll('[data-view]').forEach(btn => {
    if (btn.classList.contains('nav-item')) return;
    btn.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(btn.dataset.view);
    });
  });

  // ── Mobile sidebar ──────────────────────────────────────
  const menuToggle = document.getElementById('menu-toggle');
  const sidebarClose = document.getElementById('sidebar-close');
  const overlay = document.getElementById('sidebar-overlay');
  if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // ── Swipe to open/close sidebar ────────────────────────
  let _swipeStartX = 0;
  let _swipeStartY = 0;
  document.addEventListener('touchstart', e => {
    _swipeStartX = e.touches[0].clientX;
    _swipeStartY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - _swipeStartX;
    const dy = e.changedTouches[0].clientY - _swipeStartY;
    if (Math.abs(dy) > Math.abs(dx)) return;
    const sidebarEl = document.getElementById('sidebar');
    const isOpen = sidebarEl.classList.contains('open');
    if (!isOpen && _swipeStartX <= 30 && dx > 60) openSidebar();
    else if (isOpen && dx < -60) closeSidebar();
  }, { passive: true });

  // ── Redraw charts on orientation change ────────────────
  window.addEventListener('orientationchange', () => {
    setTimeout(refreshCurrentView, 300);
  });

  // ── Month navigation ────────────────────────────────────
  const monthPrevBtn = document.getElementById('month-prev-btn');
  const monthNextBtn = document.getElementById('month-next-btn');
  if (monthPrevBtn) monthPrevBtn.addEventListener('click', () => navigateMonth(-1));
  if (monthNextBtn) monthNextBtn.addEventListener('click', () => navigateMonth(1));

  // ── Dark mode ───────────────────────────────────────────
  const dmToggle = document.getElementById('toggle-dark-mode');
  if (dmToggle) dmToggle.addEventListener('click', toggleDarkMode);

  const settingsDmToggle = document.getElementById('settings-dark-toggle');
  if (settingsDmToggle) settingsDmToggle.addEventListener('change', () => {
    appData.settings.darkMode = settingsDmToggle.checked;
    applyTheme(appData.settings.darkMode);
    syncSettings();
  });

  // ── FAB ─────────────────────────────────────────────────
  const fab = document.getElementById('fab');
  if (fab) fab.addEventListener('click', openAddExpenseModal);

  // ── Dashboard add expense buttons ───────────────────────
  const dashAddBtn = document.getElementById('dash-add-btn');
  if (dashAddBtn) dashAddBtn.addEventListener('click', openAddExpenseModal);

  const setSalaryBtn = document.getElementById('set-salary-btn');
  if (setSalaryBtn) setSalaryBtn.addEventListener('click', openSalaryModal);

  // ── Expenses view ───────────────────────────────────────
  const addExpBtn = document.getElementById('add-expense-btn');
  if (addExpBtn) addExpBtn.addEventListener('click', openAddExpenseModal);

  const expAddEmpty = document.getElementById('expenses-add-btn');
  if (expAddEmpty) expAddEmpty.addEventListener('click', openAddExpenseModal);

  // ── Search ──────────────────────────────────────────────
  const searchInput = document.getElementById('search-input');
  const clearSearch = document.getElementById('clear-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      clearSearch.style.display = searchQuery ? 'flex' : 'none';
      renderExpenses();
    });
  }
  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      searchQuery = '';
      searchInput.value = '';
      clearSearch.style.display = 'none';
      renderExpenses();
      searchInput.focus();
    });
  }

  // ── Filter tabs ─────────────────────────────────────────
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      activeTimeFilter = tab.dataset.filter;
      const rangeBar = document.getElementById('custom-range-bar');
      if (rangeBar) rangeBar.style.display = activeTimeFilter === 'custom' ? 'flex' : 'none';
      renderExpenses();
    });
  });

  // ── Custom date range ───────────────────────────────────
  const applyRangeBtn = document.getElementById('apply-range-btn');
  if (applyRangeBtn) {
    applyRangeBtn.addEventListener('click', () => {
      customRangeFrom = document.getElementById('date-from').value || null;
      customRangeTo = document.getElementById('date-to').value || null;
      renderExpenses();
    });
  }

  // ── Expense form ────────────────────────────────────────
  const expenseForm = document.getElementById('expense-form');
  if (expenseForm) expenseForm.addEventListener('submit', handleExpenseFormSubmit);

  const expNameInput = document.getElementById('exp-name');
  if (expNameInput) {
    expNameInput.addEventListener('input', () => {
      const guess = guessCategory(expNameInput.value);
      if (guess) {
        const catSel = document.getElementById('exp-category');
        if (catSel && appData.categories.includes(guess)) catSel.value = guess;
      }
    });
  }

  const expAmountInput = document.getElementById('exp-amount');
  if (expAmountInput) expAmountInput.addEventListener('input', (e) => {
    const pos = e.target.selectionStart;
    const oldLen = e.target.value.length;
    e.target.value = formatAmountInput(e.target.value);
    const newLen = e.target.value.length;
    e.target.setSelectionRange(pos + (newLen - oldLen), pos + (newLen - oldLen));
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setModeToggle(btn.dataset.mode));
  });

  const sortDateBtn = document.getElementById('sort-date-btn');
  if (sortDateBtn) sortDateBtn.addEventListener('click', () => {
    expenseSortDir = expenseSortDir === 'desc' ? 'asc' : 'desc';
    renderExpenses();
  });

  const expCancelBtn = document.getElementById('expense-cancel-btn');
  if (expCancelBtn) expCancelBtn.addEventListener('click', () => closeModal('modal-expense'));

  const expCloseBtn = document.getElementById('expense-modal-close');
  if (expCloseBtn) expCloseBtn.addEventListener('click', () => closeModal('modal-expense'));

  const addAnotherBtn = document.getElementById('expense-add-another-btn');
  if (addAnotherBtn) addAnotherBtn.addEventListener('click', handleAddAnother);

  // ── Delete modal ────────────────────────────────────────
  const deleteCancelBtn = document.getElementById('delete-cancel-btn');
  const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
  if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', () => closeModal('modal-delete'));
  if (deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', handleDeleteConfirm);

  // ── Salary modal ────────────────────────────────────────
  const salarySkipBtn = document.getElementById('salary-skip-btn');
  const salarySaveBtn = document.getElementById('salary-save-btn');
  const salaryInput = document.getElementById('salary-input');
  if (salarySkipBtn) salarySkipBtn.addEventListener('click', () => closeModal('modal-salary'));
  if (salarySaveBtn) salarySaveBtn.addEventListener('click', handleSalarySave);
  if (salaryInput) salaryInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSalarySave(); });

  // ── Settings: currency ──────────────────────────────────
  const curSel = document.getElementById('settings-currency');
  if (curSel) {
    curSel.addEventListener('change', () => {
      appData.settings.currency = curSel.value;
      syncSettings();
      updateCurrencyPrefixes();
      refreshCurrentView();
      showToast(`Currency set to ${curSel.value}`, 'success', 2000);
    });
  }

  // ── Settings: default salary ────────────────────────────
  const saveDefSalaryBtn = document.getElementById('save-default-salary');
  if (saveDefSalaryBtn) {
    saveDefSalaryBtn.addEventListener('click', () => {
      const val = parseFloat(document.getElementById('settings-default-salary').value);
      if (isNaN(val) || val < 0) { showToast('Enter a valid salary.', 'warning'); return; }
      appData.settings.defaultSalary = val;
      syncSettings();
      showToast('Default salary saved!', 'success', 2000);
    });
  }

  // ── Settings: categories ────────────────────────────────
  const addCatBtn = document.getElementById('add-cat-btn');
  const newCatInput = document.getElementById('new-cat-input');
  if (addCatBtn) addCatBtn.addEventListener('click', () => {
    if (editingCatName) updateCategory(); else addCategory(newCatInput.value);
  });
  const cancelCatEditBtn = document.getElementById('cancel-cat-edit-btn');
  if (cancelCatEditBtn) cancelCatEditBtn.addEventListener('click', cancelEditCategory);
  if (newCatInput) {
    newCatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); if (editingCatName) updateCategory(); else addCategory(newCatInput.value); }
    });
    newCatInput.addEventListener('input', updateCatPickerPreview);
  }

  // ── Settings: export / import / reset ───────────────────
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importFile = document.getElementById('import-file');
  const resetBtn = document.getElementById('reset-btn');

  if (exportBtn) exportBtn.addEventListener('click', exportBackup);
  if (importBtn) importBtn.addEventListener('click', () => importFile.click());
  if (importFile) importFile.addEventListener('change', e => {
    importBackup(e.target.files[0]);
    e.target.value = '';
  });
  if (resetBtn) resetBtn.addEventListener('click', openResetModal);

  // ── Logout ──────────────────────────────────────────────
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    clearLoggedInUser();
    location.reload();
  });

  // ── Reset modal ─────────────────────────────────────────
  const resetCancelBtn = document.getElementById('reset-cancel-btn');
  const resetConfirmBtn = document.getElementById('reset-confirm-btn');
  if (resetCancelBtn) resetCancelBtn.addEventListener('click', () => closeModal('modal-reset'));
  if (resetConfirmBtn) resetConfirmBtn.addEventListener('click', handleResetConfirm);

  // ── Budget Planner ──────────────────────────────────────
  const budgetSaveBtn = document.getElementById('budget-save-btn');
  const budgetResetBtn = document.getElementById('budget-reset-btn');
  if (budgetSaveBtn) budgetSaveBtn.addEventListener('click', saveBudgetAllocations);
  if (budgetResetBtn) budgetResetBtn.addEventListener('click', resetBudgetAllocations);

  // ── Analytics: month select ─────────────────────────────
  const anMonthSel = document.getElementById('analytics-month-select');
  if (anMonthSel) {
    anMonthSel.addEventListener('change', () => {
      analyticsMonthId = anMonthSel.value;
      renderAnalytics();
    });
  }

  // ── Modal overlay close on backdrop click ───────────────
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay && overlay.id !== 'modal-expense') closeAllModals();
    });
  });

  // ── Window resize: redraw charts ────────────────────────
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (currentView === 'analytics') renderAnalytics();
    }, 200);
  });
}

/* ============================================================
   INITIALIZATION
   ============================================================ */

async function init() {
  // Fetch data from Supabase — loading screen stays visible until this resolves
  try {
    appData = await loadData();
  } catch {
    appData = deepClone(DEFAULT_DATA);
  }

  // Set up current month
  currentMonthId = getCurrentMonthId();
  analyticsMonthId = currentMonthId;

  // Ensure current month exists with fixed expenses copied
  ensureMonth(currentMonthId);

  // Apply saved theme early so the UI doesn't flash light mode
  applyTheme(appData.settings.darkMode);

  // Hide loading screen with a fade
  const loadingEl = document.getElementById('loading-screen');
  if (loadingEl) {
    loadingEl.style.opacity = '0';
    setTimeout(() => { loadingEl.style.display = 'none'; }, 290);
  }



  // Update month labels (sidebar chip + nav bar)
  updateSidebarMonthLabel();

  // Update currency prefixes
  updateCurrencyPrefixes();

  // Set up all event listeners
  setupEventListeners();

  // Set up keyboard shortcuts
  setupKeyboardShortcuts();

  // Show logged-in user in settings
  const useridDisplay = document.getElementById('settings-userid-display');
  if (useridDisplay) useridDisplay.textContent = getLoggedInUser() || '—';

  // Render initial view
  navigateTo('dashboard');

  // Prompt for salary if not set for current month
  const month = appData.months[currentMonthId];
  if (!month.salarySet || month.salary === 0) {
    setTimeout(() => { openSalaryModal(); }, 600);
  }

}

// Boot the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (getLoggedInUser()) {
    init();
  } else {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    setupLoginScreen();
  }
});
