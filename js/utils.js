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

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
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
