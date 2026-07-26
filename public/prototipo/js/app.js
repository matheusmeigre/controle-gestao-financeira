/* ─── Shared App Behavior ─────────────────────────────────────────────── */

function formatCurrency(value) {
  return 'R$ ' + value.toFixed(2).replace('.', ',');
}

function getToday() {
  const d = new Date();
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getCurrentMonth() {
  const d = new Date();
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function navigateTo(screen) {
  const mode = window.navigator?.standalone || window.name === 'ios-frame' ? 'same' : null;
  const target = mode === 'same' ? window : window.parent;
  target.postMessage({ action: 'navigate', screen }, '*');
}

/* ─── Tab + segmented switching ──────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const tab = e.target.closest('.tab, .seg');
  if (tab && tab.parentElement) {
    const parent = tab.parentElement;
    parent.querySelectorAll('.tab, .seg').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  }
});

/* ─── Filter chip toggle ─────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const chip = e.target.closest('.filter-chip');
  if (chip) chip.classList.toggle('active');
});

/* ─── Category pill toggle ───────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const pill = e.target.closest('.category-pill');
  if (pill && pill.parentElement) {
    pill.parentElement.querySelectorAll('.category-pill').forEach(p => p.classList.remove('selected'));
    pill.classList.add('selected');
  }
});

/* ─── Toggle switch (settings) ───────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const toggle = e.target.closest('.toggle');
  if (toggle) toggle.classList.toggle('on');
});

/* ─── Empty state fallback ────────────────────────────────────────────── */
function initEmptyState(containerSelector, dataAttr, emptySelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const items = container.querySelectorAll(`[${dataAttr}]`);
  const emptyEl = container.querySelector(emptySelector);
  if (!emptyEl) return;
  if (items.length === 0) {
    emptyEl.style.display = '';
  } else {
    emptyEl.style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', function () {
  initEmptyState('.transaction-list', 'data-transaction-id', '.empty-transactions');
  initEmptyState('.budget-list', 'data-budget-id', '.empty-budgets');
});

/* ─── Keyboard: Enter → click on interactive list items ──────────────── */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') {
    const target = e.target.closest('[tabindex="0"][role="button"]');
    if (target) { e.preventDefault(); target.click(); }
  }
});
