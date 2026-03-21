/* =====================================================
   ui.js — DOM render functions for every page
   Depends on: data.js (transactions, goals, CAT, fmt, fmtDate, calcTotals, spendingByCategory)
   ===================================================== */

// ─── SHARED: TRANSACTION ITEM HTML ─────────────────────

/**
 * Returns the HTML string for a single transaction row.
 * @param {object}  t          - transaction object
 * @param {boolean} showBadge  - whether to show income/expense badge pill
 */
function txnHTML(t, showBadge = false) {
  const cat    = CAT[t.cat] || CAT.Other;
  const isCredit = t.type === 'income';
  const badge  = showBadge
    ? `<span class="txn-badge ${isCredit ? 'badge-inc' : 'badge-exp'}">${t.type}</span>`
    : '';

  return `
    <div class="txn-item">
      <div class="txn-ico" style="background:${cat.bg}">${cat.icon}</div>
      <div class="txn-info">
        <div class="txn-name">${t.name}</div>
        <div class="txn-meta">${fmtDate(t.date)} · ${t.cat} ${badge}</div>
      </div>
      <div class="txn-amt ${isCredit ? 'cr' : 'db'}">
        ${isCredit ? '+' : '-'}${fmt(t.amt)}
      </div>
    </div>`;
}


// ─── DASHBOARD PAGE ─────────────────────────────────────

/** Update the hero balance card and stat cards with live totals */
function renderDashboardStats() {
  const { inc, exp, bal } = calcTotals();

  document.getElementById('heroAmt').textContent  = fmt(bal);
  document.getElementById('pillInc').textContent  = fmt(inc);
  document.getElementById('pillExp').textContent  = fmt(exp);
  document.getElementById('pillSav').textContent  = fmt(inc - exp);
  document.getElementById('statInc').textContent  = fmt(inc);
  document.getElementById('statExp').textContent  = fmt(exp);
}

/** Render the 6 most recent transactions in the dashboard widget */
function renderDashboardTxns() {
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  document.getElementById('txnListDash').innerHTML = recent.map(t => txnHTML(t)).join('');
}

/** Full dashboard refresh — stats + recent transactions */
function renderDashboard() {
  renderDashboardStats();
  renderDashboardTxns();
}


// ─── TRANSACTIONS PAGE ──────────────────────────────────

/** Render the full, filterable transaction list */
function renderFullTxns() {
  const query   = (document.getElementById('txnSearch')?.value || '').toLowerCase().trim();
  const typeF   = document.getElementById('txnTypeFilter')?.value || 'all';
  const catF    = document.getElementById('txnCatFilter')?.value  || 'all';

  let list = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (typeF !== 'all') list = list.filter(t => t.type === typeF);
  if (catF  !== 'all') list = list.filter(t => t.cat  === catF);
  if (query)           list = list.filter(t =>
    t.name.toLowerCase().includes(query) || t.cat.toLowerCase().includes(query)
  );

  const container = document.getElementById('txnListFull');
  container.innerHTML = list.length
    ? list.map(t => txnHTML(t, true)).join('')
    : `<div class="empty"><div class="empty-ico">🔍</div><div class="empty-txt">No transactions found</div></div>`;

  const counter = document.getElementById('txnCount');
  if (counter) counter.textContent = `${list.length} transaction${list.length !== 1 ? 's' : ''} found`;
}

/** Attached to search input and filter dropdowns */
function filterTxns() {
  renderFullTxns();
}


// ─── ACCOUNTS PAGE ──────────────────────────────────────

/** Populate the two mini transaction lists on the accounts page */
function renderAccountTxns() {
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  // Both panels show the same recent transactions for now.
  // When your backend is connected, filter by account_id here.
  document.getElementById('accTxnHdfc').innerHTML  = recent.slice(0, 3).map(t => txnHTML(t)).join('');
  document.getElementById('accTxnIcici').innerHTML = recent.slice(0, 3).map(t => txnHTML(t)).join('');
}


// ─── REPORTS PAGE ───────────────────────────────────────

/** Render the horizontal bar chart for spending by category */
function renderReportBars() {
  const byC    = spendingByCategory();
  const sorted = Object.entries(byC).sort((a, b) => b[1] - a[1]);
  const max    = sorted[0]?.[1] || 1;

  document.getElementById('reportBars').innerHTML = sorted.map(([cat, amt], i) => `
    <div class="rep-bar-row">
      <div class="rep-bar-label">${cat}</div>
      <div class="rep-bar-track">
        <div class="rep-bar-fill"
             style="width:${((amt / max) * 100).toFixed(1)}%;background:${COLORS[i % COLORS.length]}">
        </div>
      </div>
      <div class="rep-bar-val">${fmt(amt)}</div>
    </div>`
  ).join('');
}


// ─── GOALS PAGE ─────────────────────────────────────────

/** Render all goal cards plus the "Add New Goal" card */
function renderGoals() {
  const grid = document.getElementById('goalsGrid');

  const goalCards = goals.map(g => {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    return `
      <div class="goal-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div>
            <div style="font-size:1.5rem;margin-bottom:6px">${g.icon}</div>
            <div class="goal-name">${g.name}</div>
            <div class="goal-deadline">Target: ${g.deadline}</div>
          </div>
          <div class="goal-pct">${pct}%</div>
        </div>
        <div class="goal-track" style="margin-bottom:10px">
          <div class="goal-fill ${g.color}" style="width:${pct}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="font-size:.75rem;color:var(--t2)">
            Saved: <span style="color:var(--t1);font-family:var(--mono);font-weight:700">${fmt(g.saved)}</span>
          </span>
          <span style="font-size:.75rem;color:var(--t2)">
            Goal: <span style="font-family:var(--mono)">${fmt(g.target)}</span>
          </span>
        </div>
      </div>`;
  }).join('');

  const addCard = `
    <div class="add-goal-card" id="addGoalCardBtn">
      <div class="add-goal-ico">+</div>
      <div style="font-size:.82rem;font-weight:600">Add New Goal</div>
      <div style="font-size:.72rem;color:var(--t3)">Set a financial target</div>
    </div>`;

  grid.innerHTML = goalCards + addCard;

  // Re-attach click listener for the inline add card
  document.getElementById('addGoalCardBtn')
    ?.addEventListener('click', () => openGoalModal());
}


// ─── TOAST ──────────────────────────────────────────────

/**
 * Show a brief toast notification.
 * @param {string} msg   - message text
 * @param {'success'|'error'} type
 */
function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent  = (type === 'success' ? '✓  ' : '✕  ') + msg;
  el.className    = `toast ${type} show`;
  setTimeout(() => el.classList.remove('show'), 3000);
}