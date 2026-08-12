/* ============================================================
   DUPLICATE EXPENSE DETECTION
   ============================================================ */

let _pendingExpenseSave = null;

function findDuplicates(amount, category) {
  const month = appData.months[currentMonthId];
  if (!month) return [];
  return (month.expenses || []).filter(e =>
    e.amount === amount && e.category === category
  );
}

function checkDuplicatesInline() {
  const inlineWarn = document.getElementById('exp-dup-inline');
  if (!inlineWarn) return;

  if (editingExpenseId) { inlineWarn.style.display = 'none'; return; }

  const name     = document.getElementById('exp-name').value.trim();
  const amount   = parseAmountInput(document.getElementById('exp-amount').value);
  const category = document.getElementById('exp-category').value;
  const date     = document.getElementById('exp-date').value;

  if (!name || isNaN(amount) || amount <= 0 || !category || !date) {
    inlineWarn.style.display = 'none';
    return;
  }

  const dupes = findDuplicates(amount, category);
  if (dupes.length === 0) { inlineWarn.style.display = 'none'; return; }

  const list = document.getElementById('exp-dup-inline-list');
  if (list) {
    list.innerHTML = dupes.map(e =>
      `<div class="exp-dup-inline-item">
        <span class="exp-dup-inline-name">${escapeHtml(e.name)}</span>
        <span class="exp-dup-inline-meta">${formatDateShort(e.date)} &middot; ${formatCurrency(e.amount)}</span>
      </div>`
    ).join('');
  }
  inlineWarn.style.display = 'block';
}

function openDupWarningModal(dupes, proceed) {
  _pendingExpenseSave = proceed;
  const list = document.getElementById('dup-list');
  if (list) {
    list.innerHTML = dupes.map(e =>
      `<div class="dup-item">
        <span class="dup-item-name">${escapeHtml(e.name)}</span>
        <span class="dup-item-meta">${formatDateShort(e.date)} &middot; ${formatCurrency(e.amount)}</span>
      </div>`
    ).join('');
  }
  openModal('modal-dup');
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
  if (viewName === 'trends') renderTrends();
  if (viewName === 'budget') renderBudgetPlanner();
  if (viewName === 'bills') renderBills();
  if (viewName === 'history') renderHistory();
  if (viewName === 'settings') renderSettings();
}

/* ============================================================
   REFRESH
   ============================================================ */

function refreshCurrentView() {
  if (currentView === 'dashboard') renderDashboard();
  if (currentView === 'expenses') renderExpenses();
  if (currentView === 'analytics') renderAnalytics();
  if (currentView === 'trends') renderTrends();
  if (currentView === 'budget') renderBudgetPlanner();
  if (currentView === 'bills') renderBills();
  if (currentView === 'history') renderHistory();
  if (currentView === 'settings') renderSettings();
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
   MONTH NAV
   ============================================================ */

function updateSidebarMonthLabel() {
  const lbl = document.getElementById('sidebar-month-label');
  if (lbl) lbl.textContent = formatMonthName(currentMonthId);
  updateMonthNav();
}

function updateMonthNav() {
  const label = formatMonthName(currentMonthId);
  const el = document.getElementById('month-nav-label');
  if (el) el.textContent = label;

  const nav = document.querySelector('.header-month-nav');
  if (nav) {
    const showNav = currentView === 'dashboard' || currentView === 'expenses';
    nav.style.visibility = showNav ? '' : 'hidden';
  }
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
  const dupInline = document.getElementById('exp-dup-inline');
  if (dupInline) dupInline.style.display = 'none';

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
  const dupInlineEdit = document.getElementById('exp-dup-inline');
  if (dupInlineEdit) dupInlineEdit.style.display = 'none';

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
    closeModal('modal-expense');
    refreshCurrentView();
  } else {
    const dupes = findDuplicates(amount, category);
    const doSave = () => {
      const newExp = {
        id: generateId('exp'),
        name, amount, category, date, note, mode,
        timestamp: Date.now(),
      };
      month.expenses.push(newExp);
      syncInsertExpense(currentMonthId, newExp);
      showToast('Expense added!', 'success');
      closeModal('modal-expense');
      refreshCurrentView();
      if (!month.salarySet || !month.salary) setTimeout(() => openSalaryModal(), 300);
    };
    if (dupes.length > 0) {
      openDupWarningModal(dupes, doSave);
    } else {
      doSave();
    }
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

  const doSaveAnother = () => {
    const newExp = {
      id: generateId('exp'),
      name, amount, category, date, note, mode,
      timestamp: Date.now(),
    };
    month.expenses.push(newExp);
    syncInsertExpense(currentMonthId, newExp);
    showToast('Expense added!', 'success');
    document.getElementById('exp-name').value = '';
    document.getElementById('exp-amount').value = '';
    document.getElementById('exp-note').value = '';
    document.getElementById('exp-name').focus();
    refreshCurrentView();
  };

  const dupes = findDuplicates(amount, category);
  if (dupes.length > 0) {
    openDupWarningModal(dupes, doSaveAnother);
  } else {
    doSaveAnother();
  }
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
   BILLS CRUD
   ============================================================ */

function openAddBillModal() {
  editingBillId = null;
  document.getElementById('bill-modal-title').textContent = 'Add Bill';
  document.getElementById('bill-modal-save-label').textContent = 'Add Bill';
  document.getElementById('bill-prefix').textContent = appData.settings.currency || '₹';
  document.getElementById('bill-name-input').value = '';
  document.getElementById('bill-amount-input').value = '';
  openModal('modal-bill');
}

function openEditBillModal(id) {
  const bill = (appData.bills || []).find(b => b.id === id);
  if (!bill) return;
  editingBillId = id;
  document.getElementById('bill-modal-title').textContent = 'Edit Bill';
  document.getElementById('bill-modal-save-label').textContent = 'Save';
  document.getElementById('bill-prefix').textContent = appData.settings.currency || '₹';
  document.getElementById('bill-name-input').value = bill.name;
  document.getElementById('bill-amount-input').value = bill.amount;
  openModal('modal-bill');
}

function handleBillSave() {
  const name = document.getElementById('bill-name-input').value.trim();
  const amount = parseFloat(document.getElementById('bill-amount-input').value);
  if (!name) { showToast('Enter a bill name.', 'warning'); return; }
  if (isNaN(amount) || amount < 0) { showToast('Enter a valid amount.', 'warning'); return; }

  if (editingBillId) {
    const idx = (appData.bills || []).findIndex(b => b.id === editingBillId);
    if (idx !== -1) {
      appData.bills[idx] = { ...appData.bills[idx], name, amount };
      syncUpdateBill(appData.bills[idx]);
      showToast('Bill updated!', 'success');
    }
  } else {
    const newBill = { id: generateId('bill'), name, amount };
    appData.bills.push(newBill);
    syncInsertBill(newBill);
    showToast('Bill added!', 'success');
  }

  closeModal('modal-bill');
  renderBills();
  if (currentView === 'dashboard') renderDashboard();
}

function deleteBill(id) {
  appData.bills = (appData.bills || []).filter(b => b.id !== id);
  syncDeleteBill(id);
  showToast('Bill deleted.', 'success');
  renderBills();
  if (currentView === 'dashboard') renderDashboard();
}

/* ============================================================
   BACKUP — IMPORT
   ============================================================ */

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
   LOGIN SCREEN
   ============================================================ */

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

  // ── Filter tabs (expenses) ───────────────────────────────
  document.querySelectorAll('#view-expenses .filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#view-expenses .filter-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      activeTimeFilter = tab.dataset.filter;
      const periodSel = document.getElementById('period-filter-select');
      if (periodSel) periodSel.value = activeTimeFilter;
      const rangeBar = document.getElementById('custom-range-bar');
      if (rangeBar) rangeBar.style.display = activeTimeFilter === 'custom' ? 'flex' : 'none';
      renderExpenses();
    });
  });

  // ── Desktop period select dropdown (expenses) ────────────
  const periodFilterSelect = document.getElementById('period-filter-select');
  if (periodFilterSelect) {
    periodFilterSelect.addEventListener('change', () => {
      activeTimeFilter = periodFilterSelect.value;
      document.querySelectorAll('#view-expenses .filter-tab').forEach(t => {
        const isActive = t.dataset.filter === activeTimeFilter;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      const rangeBar = document.getElementById('custom-range-bar');
      if (rangeBar) rangeBar.style.display = activeTimeFilter === 'custom' ? 'flex' : 'none';
      renderExpenses();
    });
  }

  // ── Budget period filter tabs ───────────────────────────
  document.querySelectorAll('#view-budget .filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      budgetTimeFilter = tab.dataset.bfilter;
      renderBudgetPlanner();
    });
  });

  const budgetApplyRange = document.getElementById('budget-apply-range');
  if (budgetApplyRange) {
    budgetApplyRange.addEventListener('click', () => {
      budgetRangeFrom = document.getElementById('budget-from-month').value || '';
      budgetRangeTo = document.getElementById('budget-to-month').value || '';
      renderBudgetPlanner();
    });
  }

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
      checkDuplicatesInline();
    });
  }

  const expAmountInput = document.getElementById('exp-amount');
  if (expAmountInput) expAmountInput.addEventListener('input', (e) => {
    const pos = e.target.selectionStart;
    const oldLen = e.target.value.length;
    e.target.value = formatAmountInput(e.target.value);
    const newLen = e.target.value.length;
    e.target.setSelectionRange(pos + (newLen - oldLen), pos + (newLen - oldLen));
    checkDuplicatesInline();
  });

  const expCategoryInput = document.getElementById('exp-category');
  if (expCategoryInput) expCategoryInput.addEventListener('change', checkDuplicatesInline);

  const expDateInput = document.getElementById('exp-date');
  if (expDateInput) expDateInput.addEventListener('change', checkDuplicatesInline);

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setModeToggle(btn.dataset.mode));
  });

  const expViewToggle = document.getElementById('expense-view-toggle');
  if (expViewToggle) expViewToggle.addEventListener('click', () => {
    expenseViewMode = expenseViewMode === 'list' ? 'tile' : 'list';
    localStorage.setItem('expenseViewMode', expenseViewMode);
    renderExpenses();
  });

  const catScrollBtn = document.getElementById('cat-chips-scroll-btn');
  if (catScrollBtn) catScrollBtn.addEventListener('click', () => {
    const bar = document.getElementById('cat-chips-bar');
    if (bar) bar.scrollBy({ left: 160, behavior: 'smooth' });
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

  // ── Duplicate warning modal ──────────────────────────────
  const dupCancelBtn = document.getElementById('dup-cancel-btn');
  const dupProceedBtn = document.getElementById('dup-proceed-btn');
  if (dupCancelBtn) dupCancelBtn.addEventListener('click', () => {
    closeModal('modal-dup');
    _pendingExpenseSave = null;
  });
  if (dupProceedBtn) dupProceedBtn.addEventListener('click', () => {
    closeModal('modal-dup');
    if (_pendingExpenseSave) { _pendingExpenseSave(); _pendingExpenseSave = null; }
  });

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

  // ── Bills Buffer tile — navigate to bills view ──────────
  const editBillsBtn = document.getElementById('edit-bills-month-btn');
  if (editBillsBtn) editBillsBtn.addEventListener('click', () => navigateTo('bills'));

  // ── Bill add/edit modal ─────────────────────────────────
  const billModalCancel = document.getElementById('bill-modal-cancel');
  const billModalSave = document.getElementById('bill-modal-save');
  const billNameInput = document.getElementById('bill-name-input');
  const billAmountInput = document.getElementById('bill-amount-input');
  if (billModalCancel) billModalCancel.addEventListener('click', () => closeModal('modal-bill'));
  if (billModalSave) billModalSave.addEventListener('click', handleBillSave);
  if (billNameInput) billNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('bill-amount-input')?.focus(); });
  if (billAmountInput) billAmountInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleBillSave(); });

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

  // ── Bills view ──────────────────────────────────────────
  const addBillBtn = document.getElementById('add-bill-btn');
  if (addBillBtn) addBillBtn.addEventListener('click', openAddBillModal);

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
  if (exportBtn) exportBtn.addEventListener('click', exportBackup);
  if (importBtn) importBtn.addEventListener('click', () => importFile.click());
  if (importFile) importFile.addEventListener('change', e => {
    importBackup(e.target.files[0]);
    e.target.value = '';
  });

  // ── Logout ──────────────────────────────────────────────
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    clearLoggedInUser();
    location.reload();
  });

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

  // ── Trends: month range selects ─────────────────────────
  const trFromSel = document.getElementById('trends-from-select');
  const trToSel = document.getElementById('trends-to-select');
  if (trFromSel) {
    trFromSel.addEventListener('change', () => {
      trendFromMonth = trFromSel.value;
      if (trendFromMonth > trendToMonth) { trendToMonth = trendFromMonth; }
      renderTrends();
    });
  }
  if (trToSel) {
    trToSel.addEventListener('change', () => {
      trendToMonth = trToSel.value;
      if (trendToMonth < trendFromMonth) { trendFromMonth = trendToMonth; }
      renderTrends();
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
  const _now = new Date();
  trendFromMonth = `${_now.getFullYear()}-01`;
  trendToMonth = currentMonthId;

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
