/* ============================================================
   RENDER — BUDGET PLANNER
   ============================================================ */

function renderBudgetPlanner() {
  // Sync range bar and active tab to current filter state
  const budRangeBar = document.getElementById('budget-range-bar');
  if (budRangeBar) budRangeBar.style.display = budgetTimeFilter === 'range' ? 'flex' : 'none';
  document.querySelectorAll('#view-budget .filter-tab').forEach(t => {
    const isActive = t.dataset.bfilter === budgetTimeFilter;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Aggregate salary + expenses across all months in the selected period
  const monthIds = getBudgetMonthIds();
  let salary = 0;
  const catTotals = {};
  let totalSpent = 0;
  monthIds.forEach(id => {
    const m = appData.months[id];
    if (m) {
      salary += (m.salary || 0);
      (m.expenses || []).forEach(e => {
        catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
        totalSpent += e.amount;
      });
    }
  });
  const rows = getBudgetAllocations().map(alloc => calcBudgetRow(salary, alloc, catTotals));

  // Subtitle
  const subtitle = document.getElementById('budget-view-subtitle');
  if (subtitle) {
    if (monthIds.length === 0) {
      subtitle.textContent = 'No data for the selected period';
    } else if (monthIds.length === 1) {
      const mId = monthIds[0];
      subtitle.innerHTML = salary > 0
        ? `Allocating <strong>${formatFullAmount(salary)}</strong> for ${formatMonthName(mId)}`
        : 'Set your monthly salary to see budget calculations';
    } else {
      const rangeText = `${formatMonthName(monthIds[0])} – ${formatMonthName(monthIds[monthIds.length - 1])}`;
      subtitle.innerHTML = salary > 0
        ? `${rangeText} · <strong>${formatFullAmount(salary)}</strong> combined`
        : `${rangeText} · No salary data`;
    }
  }

  // Health card values
  const totalBudgeted = rows.reduce((s, r) => s + r.budget, 0);
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
    const tagText = row.expCat ? row.expCat.map(escapeHtml).join(' + ') : 'Reserved';

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
  const [cy, cm] = currentMonthId.split('-').map(Number);
  const prevMonthId = cm === 1
    ? `${cy - 1}-12`
    : `${cy}-${String(cm - 1).padStart(2, '0')}`;
  document.getElementById('stat-salary-sub').textContent =
    month && month.salarySet ? `Salary — ${formatMonthName(prevMonthId)}` : 'Tap to set salary';

  document.getElementById('stat-spent').textContent = formatFullAmount(stats.totalSpent);
  document.getElementById('stat-count').textContent = `${stats.count} transaction${stats.count !== 1 ? 's' : ''}`;

  document.getElementById('stat-remaining').textContent = formatFullAmount(stats.remaining);
  document.getElementById('stat-daily').textContent =
    stats.salary > 0
      ? `${formatCurrency(stats.dailyLimit)}/day — ${stats.daysRemaining} days left`
      : 'Set salary to calculate';

  const savingsEl = document.getElementById('stat-savings');
  savingsEl.className = 'stat-value';
  savingsEl.textContent = (stats.savings < 0 ? '-' : '') + formatFullAmount(stats.savings);
  if (stats.salary > 0 && stats.savings < 0) savingsEl.classList.add('danger');
  const savingsPct = stats.salary > 0
    ? Math.round((stats.savings / stats.salary) * 100)
    : 0;
  document.getElementById('stat-savings-pct').textContent = `${savingsPct}% of salary`;

  // 50% rule card (non-loan expenses vs half salary)
  const nlRemEl = document.getElementById('stat-nonloan-remaining');
  if (nlRemEl) {
    nlRemEl.className = 'stat-value';
    if (stats.salary > 0) {
      const nlPct = Math.round(stats.nonLoanPct);
      nlRemEl.textContent = (stats.nonLoanRemaining < 0 ? '-' : '') + formatFullAmount(stats.nonLoanRemaining);
      if (nlPct >= 100) nlRemEl.classList.add('danger');
      else if (nlPct >= 80) nlRemEl.classList.add('warning');
      else nlRemEl.classList.add('success');
      document.getElementById('stat-nonloan-sub').textContent =
        `${nlPct}% of ${formatCurrency(stats.halfSalary)} used · excl. loans`;
    } else {
      nlRemEl.textContent = '₹0';
      document.getElementById('stat-nonloan-sub').textContent = 'Set salary to calculate';
    }
  }

  // Bills Buffer card (safe-to-spend after subtracting default bills total)
  const bbSafeEl = document.getElementById('stat-bills-safe');
  const bbSubEl = document.getElementById('stat-bills-safe-sub');
  if (bbSafeEl) {
    const bills = appData.bills || [];
    const totalBills = bills.reduce((s, b) => s + b.amount, 0);
    const safeToSpend = stats.nonLoanRemaining - totalBills;
    bbSafeEl.className = 'stat-value';
    if (stats.salary > 0) {
      bbSafeEl.textContent = (safeToSpend < 0 ? '-' : '') + formatFullAmount(Math.abs(safeToSpend));
      if (safeToSpend < 0) bbSafeEl.classList.add('danger');
      else if (stats.nonLoanPct >= 80) bbSafeEl.classList.add('warning');
      else bbSafeEl.classList.add('success');
      if (bbSubEl) {
        bbSubEl.textContent = bills.length > 0
          ? `${formatCurrency(totalBills)} in ${bills.length} bill${bills.length !== 1 ? 's' : ''}`
          : 'No bills added · Go to Bills';
      }
    } else {
      bbSafeEl.textContent = '₹0';
      if (bbSubEl) bbSubEl.textContent = 'Set salary to calculate';
    }
  }

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
            <div style="flex:1;min-width:0;width:100%">
              <div class="mini-item-name">${escapeHtml(cat)}</div>
              <div style="width:100%;background:var(--border);border-radius:9999px;margin-top:4px;height:6px;overflow:hidden">
                <div style="width:${barW}%;height:6px;background:${meta.color};border-radius:9999px"></div>
              </div>
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
  const allExpenses = activeTimeFilter === 'all'
    ? Object.values(appData.months).flatMap(m => m.expenses || [])
    : month ? [...(month.expenses || [])] : [];

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

  // Sync sort button icon + tooltip
  const sortBtn = document.getElementById('sort-date-btn');
  const sortIcon = document.getElementById('sort-date-icon');
  if (sortIcon) sortIcon.textContent = expenseSortDir === 'desc' ? 'arrow_downward' : 'arrow_upward';
  if (sortBtn) sortBtn.title = expenseSortDir === 'desc' ? 'Newest first' : 'Oldest first';

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

  // Sync view toggle icon
  const viewIcon = document.getElementById('expense-view-icon');
  if (viewIcon) viewIcon.textContent = expenseViewMode === 'tile' ? 'view_list' : 'grid_view';

  if (expenseViewMode === 'tile') {
    container.className = 'expenses-tile-grid';
    container.innerHTML = filtered.map(e => buildExpenseTileHtml(e)).join('');
  } else {
    container.className = 'expenses-grouped';
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
  }

  attachExpenseItemEvents(container);
}

function buildDateLabel(dateStr) {
  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return formatDate(dateStr);
}

function buildExpenseItemHtml(e, compact) {
  const meta = getCatMeta(e.category);
  const noteTag = e.note && !compact
    ? `<span class="expense-note-label">${escapeHtml(e.note)}</span>`
    : '';
  const excludedTag = e.name.toLowerCase().includes('loan')
    ? `<span class="expense-excl-badge">Excl. 50%</span>`
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
          <span class="expense-mode-badge ${(e.mode || 'Cash') === 'Cash' ? 'cash' : (e.mode || '') === 'GPay' ? 'gpay' : ''}">${escapeHtml(e.mode || 'Cash')}</span>
          ${excludedTag}
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

function buildExpenseTileHtml(e) {
  const meta = getCatMeta(e.category);
  const excludedTag = e.name.toLowerCase().includes('loan')
    ? `<span class="expense-excl-badge">Excl. 50%</span>`
    : '';
  return `
    <div class="expense-tile" data-id="${escapeHtml(e.id)}">
      <div class="expense-tile-header" style="background:${meta.color}18">
        <div class="expense-tile-icon" style="color:${meta.color}">
          <span class="material-symbols-rounded">${meta.icon}</span>
        </div>
        <div class="expense-tile-amount">${formatCurrency(e.amount)}</div>
      </div>
      <div class="expense-tile-body">
        <div class="expense-tile-name">${escapeHtml(e.name)}</div>
        <div class="expense-tile-meta">
          <span class="expense-cat-label">${escapeHtml(e.category)}</span>
          <span class="expense-tile-date">${formatDateShort(e.date)}</span>
        </div>
        <div class="expense-tile-footer">
          <span>${e.mode ? `<span class="expense-mode-badge ${e.mode === 'Cash' ? 'cash' : e.mode === 'GPay' ? 'gpay' : ''}">${escapeHtml(e.mode)}</span>` : ''}${excludedTag}</span>
          <div class="expense-tile-actions">
            <button class="icon-btn" data-action="edit" data-id="${escapeHtml(e.id)}" aria-label="Edit ${escapeHtml(e.name)}">
              <span class="material-symbols-rounded">edit</span>
            </button>
            <button class="icon-btn danger" data-action="delete" data-id="${escapeHtml(e.id)}" aria-label="Delete ${escapeHtml(e.name)}">
              <span class="material-symbols-rounded">delete</span>
            </button>
          </div>
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
  const sorted = [...appData.categories].sort((a, b) => a.localeCompare(b));
  const cats = ['all', ...sorted];

  // Desktop chip bar
  if (bar) {
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

  // Mobile custom dropdown
  const dropdown = document.getElementById('cat-filter-dropdown');
  const menu = document.getElementById('cat-filter-menu');
  const btnLabel = document.getElementById('cat-filter-btn-label');
  const btnIcon = document.getElementById('cat-filter-btn-icon');
  const btn = document.getElementById('cat-filter-btn');

  if (menu && dropdown) {
    const activeMeta = activeCatFilter === 'all' ? null : getCatMeta(activeCatFilter);
    if (btnLabel) btnLabel.textContent = activeCatFilter === 'all' ? 'All Categories' : activeCatFilter;
    if (btnIcon) btnIcon.textContent = activeCatFilter === 'all' ? 'apps' : (activeMeta?.icon || 'category');

    menu.innerHTML = cats.map(cat => {
      const meta = cat === 'all' ? null : getCatMeta(cat);
      const icon = cat === 'all' ? 'apps' : (meta?.icon || 'category');
      const isActive = activeCatFilter === cat;
      return `<button class="cat-filter-option${isActive ? ' active' : ''}" data-cat="${escapeHtml(cat)}">
        <span class="material-symbols-rounded">${icon}</span>
        ${cat === 'all' ? 'All Categories' : escapeHtml(cat)}
      </button>`;
    }).join('');

    menu.querySelectorAll('.cat-filter-option').forEach(opt => {
      opt.addEventListener('click', () => {
        activeCatFilter = opt.dataset.cat;
        dropdown.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        renderExpenses();
      });
    });

    if (!dropdown._listenerAttached) {
      dropdown._listenerAttached = true;
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
      });
      document.addEventListener('click', () => {
        dropdown.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    }
  }
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
   TRENDS VIEW
   ============================================================ */

function renderTrends() {
  const curMonthId = getCurrentMonthId();
  const curYear = new Date().getFullYear();

  // Build full selectable range: earliest of (Jan current year, oldest data month) → current month
  const allDataMonths = Object.keys(appData.months).sort();
  const defaultFrom = `${curYear}-01`;
  const earliest = allDataMonths.length > 0 && allDataMonths[0] < defaultFrom
    ? allDataMonths[0]
    : defaultFrom;

  // Clamp state
  if (!trendFromMonth || trendFromMonth < earliest) trendFromMonth = defaultFrom;
  if (!trendToMonth || trendToMonth > curMonthId) trendToMonth = curMonthId;
  if (trendFromMonth > trendToMonth) trendFromMonth = trendToMonth;

  const selectableMonths = getMonthsInRange(earliest, curMonthId);

  const monthOptions = selectableMonths
    .map(mid => `<option value="${mid}">${formatMonthName(mid)}</option>`)
    .join('');

  const fromSel = document.getElementById('trends-from-select');
  const toSel = document.getElementById('trends-to-select');
  if (fromSel) { fromSel.innerHTML = monthOptions; fromSel.value = trendFromMonth; }
  if (toSel)   { toSel.innerHTML = monthOptions;   toSel.value = trendToMonth;   }

  // Aggregate data across range
  const rangeMonths = getMonthsInRange(trendFromMonth, trendToMonth);
  const monthBadge = document.getElementById('tr-months-badge');
  if (monthBadge) monthBadge.textContent = `${rangeMonths.length} month${rangeMonths.length !== 1 ? 's' : ''}`;

  const rangeLabel = rangeMonths.length === 1
    ? formatMonthName(rangeMonths[0])
    : `${formatMonthShort(rangeMonths[0])} – ${formatMonthShort(rangeMonths[rangeMonths.length - 1])}`;
  const rangeLabelEl = document.getElementById('tr-range-label');
  if (rangeLabelEl) rangeLabelEl.textContent = rangeLabel;

  let totalSalary = 0;
  let totalSpent = 0;
  let totalCount = 0;
  const catTotals = {};
  const monthlyData = {};

  rangeMonths.forEach(mid => {
    const month = appData.months[mid];
    monthlyData[mid] = {};
    if (month) {
      totalSalary += month.salary || 0;
      (month.expenses || []).forEach(e => {
        totalSpent += e.amount;
        totalCount++;
        catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
        monthlyData[mid][e.category] = (monthlyData[mid][e.category] || 0) + e.amount;
      });
    }
  });

  const numMonths = rangeMonths.length || 1;
  document.getElementById('tr-spent').textContent = formatFullAmount(totalSpent);
  document.getElementById('tr-salary').textContent = formatFullAmount(totalSalary);
  document.getElementById('tr-count').textContent = totalCount;
  document.getElementById('tr-avg').textContent = formatCurrency(totalSpent / numMonths);

  const pct = totalSalary > 0 ? Math.round((totalSpent / totalSalary) * 100) : 0;
  const pctEl = document.getElementById('tr-pct');
  if (pctEl) {
    pctEl.textContent = `${pct}%`;
    pctEl.className = `an-value ${pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'success'}`;
  }

  renderTrendsCategoryTable(catTotals, totalSpent, totalSalary);
  renderTrendsMonthlyTable(rangeMonths, monthlyData, catTotals);
}

function renderTrendsCategoryTable(catTotals, totalSpent, totalSalary) {
  const table = document.getElementById('trends-cat-table');
  const emptyEl = document.getElementById('trends-empty');
  if (!table) return;

  const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    table.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  const maxAmt = sorted[0][1];

  table.innerHTML = sorted.map(([cat, amt]) => {
    const meta = getCatMeta(cat);
    const barPct = maxAmt > 0 ? (amt / maxAmt) * 100 : 0;
    const pctOfSpend = totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(1) : '0';
    const pctOfIncome = totalSalary > 0 ? ((amt / totalSalary) * 100).toFixed(1) + '%' : '—';
    return `
      <div class="trends-cat-row">
        <div class="trc-name">
          <span class="material-symbols-rounded trc-cat-icon" style="color:${meta.color}" aria-hidden="true">${meta.icon}</span>
          <span class="trc-cat-label">${escapeHtml(cat)}</span>
        </div>
        <div class="trc-bar-col">
          <div class="trc-bar-track">
            <div class="trc-bar-fill" style="width:${barPct}%;background:${meta.color}"></div>
          </div>
        </div>
        <div class="trc-amt">${formatFullAmount(amt)}</div>
        <div class="trc-pct-spend">${pctOfSpend}%</div>
        <div class="trc-pct-income">${pctOfIncome}</div>
      </div>`;
  }).join('');
}

function renderTrendsMonthlyTable(rangeMonths, monthlyData, catTotals) {
  const thead = document.getElementById('trends-monthly-thead');
  const tbody = document.getElementById('trends-monthly-tbody');
  const card = document.getElementById('trends-monthly-card');
  const emptyEl = document.getElementById('trends-monthly-empty');
  if (!thead || !tbody || !card) return;

  const cats = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]);

  if (cats.length === 0) {
    card.style.display = 'none';
    return;
  }
  card.style.display = '';
  if (emptyEl) emptyEl.style.display = 'none';

  // Find max cell value for heatmap
  let maxVal = 0;
  rangeMonths.forEach(mid => {
    cats.forEach(cat => {
      const v = (monthlyData[mid] || {})[cat] || 0;
      if (v > maxVal) maxVal = v;
    });
  });

  thead.innerHTML = `<tr>
    <th class="tmt-cat-col">Category</th>
    ${rangeMonths.map(mid => `<th class="tmt-month-col">${formatMonthShort(mid)}</th>`).join('')}
    <th class="tmt-total-col">Total</th>
  </tr>`;

  tbody.innerHTML = cats.map(cat => {
    const meta = getCatMeta(cat);
    const total = catTotals[cat] || 0;
    const cells = rangeMonths.map(mid => {
      const v = (monthlyData[mid] || {})[cat] || 0;
      const intensity = (maxVal > 0 && v > 0) ? Math.min(8, Math.ceil((v / maxVal) * 8)) : 0;
      return `<td class="tmt-cell" data-intensity="${intensity}" title="${v > 0 ? formatFullAmount(v) : ''}">${v > 0 ? formatCurrency(v) : '—'}</td>`;
    }).join('');
    return `<tr>
      <td class="tmt-cat-cell">
        <span class="material-symbols-rounded tmt-cat-icon" style="color:${meta.color}" aria-hidden="true">${meta.icon}</span>
        ${escapeHtml(cat)}
      </td>
      ${cells}
      <td class="tmt-total-cell">${formatFullAmount(total)}</td>
    </tr>`;
  }).join('');
}

/* ============================================================
   CHARTS — CANVAS
   ============================================================ */

let _barChartMeta = null;
let _donutChartMeta = null;
let _tooltipHideTimer = null;

function getEventCoords(e) {
  if (e.touches && e.touches.length > 0) {
    return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
  }
  return { clientX: e.clientX, clientY: e.clientY };
}

function showChartTooltip(e, html) {
  clearTimeout(_tooltipHideTimer);
  const tt = document.getElementById('chart-tooltip');
  if (!tt) return;
  tt.innerHTML = html;
  tt.style.display = 'block';
  const { clientX, clientY } = getEventCoords(e);
  const pad = 14;
  const tw = tt.offsetWidth, th = tt.offsetHeight;
  let left = clientX + pad;
  let top = clientY - th / 2;
  if (left + tw > window.innerWidth - pad) left = clientX - tw - pad;
  if (top < pad) top = pad;
  if (top + th > window.innerHeight - pad) top = window.innerHeight - th - pad;
  tt.style.left = left + 'px';
  tt.style.top = top + 'px';
}

function hideChartTooltip() {
  clearTimeout(_tooltipHideTimer);
  const tt = document.getElementById('chart-tooltip');
  if (tt) tt.style.display = 'none';
}

function hideChartTooltipDelayed() {
  clearTimeout(_tooltipHideTimer);
  _tooltipHideTimer = setTimeout(hideChartTooltip, 2000);
}

function onBarChartMouse(e) {
  const m = _barChartMeta;
  if (!m) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const { clientX, clientY } = getEventCoords(e);
  const mx = clientX - rect.left;
  const my = clientY - rect.top;
  for (let i = 0; i < m.months.length; i++) {
    const x = m.padL + m.gap + i * (m.barW + m.gap);
    const barH = m.values[i] > 0 ? (m.values[i] / m.maxVal) * m.chartH : 0;
    const y = m.padT + m.chartH - barH;
    if (mx >= x && mx <= x + m.barW && my >= y && my <= m.padT + m.chartH) {
      e.currentTarget.style.cursor = 'pointer';
      showChartTooltip(e,
        `<div class="tt-label">${escapeHtml(m.labels[i])}</div>` +
        `<div class="tt-value">${formatCurrency(m.values[i])}</div>`);
      return;
    }
  }
  e.currentTarget.style.cursor = 'default';
  hideChartTooltip();
}

function onDonutChartMouse(e) {
  const m = _donutChartMeta;
  if (!m) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const { clientX, clientY } = getEventCoords(e);
  const mx = clientX - rect.left;
  const my = clientY - rect.top;
  const dx = mx - m.cx, dy = my - m.cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < m.innerR || dist > m.outerR) {
    e.currentTarget.style.cursor = 'default';
    hideChartTooltip();
    return;
  }
  let ang = Math.atan2(dy, dx);
  if (ang < -Math.PI / 2) ang += Math.PI * 2;
  for (const s of m.slices) {
    if (ang >= s.startAngle && ang < s.startAngle + s.sweep) {
      const pct = m.total > 0 ? Math.round((s.amt / m.total) * 100) : 0;
      e.currentTarget.style.cursor = 'pointer';
      showChartTooltip(e,
        `<div class="tt-label">${escapeHtml(s.cat)}</div>` +
        `<div class="tt-value">${formatCurrency(s.amt)} <span class="tt-pct">${pct}%</span></div>`);
      return;
    }
  }
  e.currentTarget.style.cursor = 'default';
  hideChartTooltip();
}

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

  _barChartMeta = { months, labels, values, maxVal, padL, padT, chartH, barW, gap };

  const barCanvas = document.getElementById('bar-chart');
  if (barCanvas && !barCanvas._chartListeners) {
    barCanvas._chartListeners = true;
    barCanvas.addEventListener('mousemove', onBarChartMouse);
    barCanvas.addEventListener('mouseleave', hideChartTooltip);
    barCanvas.addEventListener('touchstart', onBarChartMouse, { passive: true });
    barCanvas.addEventListener('touchmove', onBarChartMouse, { passive: true });
    barCanvas.addEventListener('touchend', hideChartTooltipDelayed);
  }

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
    grad.addColorStop(0, isCurrent ? '#279979' : '#34B896');
    grad.addColorStop(1, isCurrent ? '#1E7A5E' : '#7DD5B8');

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
      ctx.fillStyle = 'rgba(39,153,121,0.08)';
      ctx.fillRect(x - 4, padT, barW + 8, chartH);
    }

    // X label
    ctx.fillStyle = isCurrent ? '#279979' : textColor;
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
  const donutSlices = [];

  sorted.forEach(([cat, amt]) => {
    const sweep = (amt / total) * Math.PI * 2;
    donutSlices.push({ cat, amt, startAngle, sweep });
    const meta = getCatMeta(cat);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, startAngle, startAngle + sweep);
    ctx.closePath();
    ctx.fillStyle = meta.color;
    ctx.fill();
    startAngle += sweep;
  });

  _donutChartMeta = { slices: donutSlices, cx, cy, outerR, innerR, total };

  if (!canvas._chartListeners) {
    canvas._chartListeners = true;
    canvas.addEventListener('mousemove', onDonutChartMouse);
    canvas.addEventListener('mouseleave', hideChartTooltip);
    canvas.addEventListener('touchstart', onDonutChartMouse, { passive: true });
    canvas.addEventListener('touchmove', onDonutChartMouse, { passive: true });
    canvas.addEventListener('touchend', hideChartTooltipDelayed);
  }

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
    ctx.fillStyle = isCurrent ? '#279979' : textColor;
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
    const barColor = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#279979';

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
   RENDER — BILLS VIEW
   ============================================================ */

function renderBills() {
  const bills = appData.bills || [];
  const total = bills.reduce((s, b) => s + b.amount, 0);
  const cur = appData.settings.currency;

  const totalEl = document.getElementById('bills-total');
  const subEl = document.getElementById('bills-summary-sub');
  if (totalEl) totalEl.textContent = formatFullAmount(total);
  if (subEl) subEl.textContent = `${bills.length} bill${bills.length !== 1 ? 's' : ''} · deducted from 50% budget`;

  const list = document.getElementById('bills-list');
  const emptyEl = document.getElementById('bills-empty');
  if (!list) return;

  if (bills.length === 0) {
    list.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  list.innerHTML = bills.map(b => `
    <div class="bill-item" data-id="${escapeHtml(b.id)}">
      <div class="bill-item-icon" aria-hidden="true">
        <span class="material-symbols-rounded">receipt_long</span>
      </div>
      <div class="bill-item-name">${escapeHtml(b.name)}</div>
      <div class="bill-item-amount">${formatCurrency(b.amount)}</div>
      <div class="bill-item-actions">
        <button class="icon-btn" data-action="edit" data-id="${escapeHtml(b.id)}" aria-label="Edit ${escapeHtml(b.name)}">
          <span class="material-symbols-rounded">edit</span>
        </button>
        <button class="icon-btn danger" data-action="delete" data-id="${escapeHtml(b.id)}" aria-label="Delete ${escapeHtml(b.name)}">
          <span class="material-symbols-rounded">delete</span>
        </button>
      </div>
    </div>`).join('');

  list.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (btn.dataset.action === 'edit') openEditBillModal(btn.dataset.id);
      if (btn.dataset.action === 'delete') deleteBill(btn.dataset.id);
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
