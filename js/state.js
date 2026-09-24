/* ============================================================
   APP STATE
   ============================================================ */

let appData = null;
let currentView = 'dashboard';
let currentMonthId = '';
let analyticsMonthId = '';
let activeCatFilter = 'all';
let searchQuery = '';
let expenseSortDir = 'desc'; // 'desc' = newest first, 'asc' = oldest first
let expenseViewMode = localStorage.getItem('expenseViewMode') || 'list'; // 'list' | 'tile'
let fuelViewMode = localStorage.getItem('fuelViewMode') || 'fills'; // 'fills' | 'monthly'
let trendFromMonth = '';
let trendToMonth = '';
let editingExpenseId = null;
let newCatIcon = 'category';
let newCatColor = '#64748B';
let editingCatName = null;
let deleteTarget = null;
let deleteContext = null;
let cloudAvailable = false;
let budgetTimeFilter = 'month'; // 'month' | 'last-month' | 'range' | 'all'
let budgetRangeFrom = '';
let budgetRangeTo = '';

// "Where Did It Go?" search view state
let wdigPreset = 'all'; // '7d' | '30d' | '3m' | 'year' | 'all' | 'custom'
let wdigDateFrom = null;
let wdigDateTo = null;
let wdigCategory = 'all';
let wdigQuery = '';
