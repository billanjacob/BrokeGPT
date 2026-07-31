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
let expenseViewMode = localStorage.getItem('expenseViewMode') || 'list'; // 'list' | 'tile'
let trendFromMonth = '';
let trendToMonth = '';
let editingExpenseId = null;
let newCatIcon = 'category';
let newCatColor = '#64748B';
let editingCatName = null;
let deleteTarget = null;
let deleteContext = null;
let cloudAvailable = false;
