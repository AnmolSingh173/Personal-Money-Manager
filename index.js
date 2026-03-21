// ── DATA STORE ──────────────────────────────────────
const CATEGORY_ICONS = {
  Food:          { icon: '🛒', bg: 'rgba(29,185,84,0.15)',  color: '#1DB954' },
  Transport:     { icon: '🚌', bg: 'rgba(255,164,43,0.15)', color: '#FFA42B' },
  Bills:         { icon: '💡', bg: 'rgba(61,145,244,0.15)', color: '#3D91F4' },
  Salary:        { icon: '💼', bg: 'rgba(29,185,84,0.15)',  color: '#1DB954' },
  Rent:          { icon: '🏠', bg: 'rgba(188,95,255,0.15)', color: '#BC5FFF' },
  Entertainment: { icon: '🎬', bg: 'rgba(233,20,41,0.15)',  color: '#E91429' },
  Shopping:      { icon: '🛍️', bg: 'rgba(255,164,43,0.15)', color: '#FFA42B' },
  Savings:       { icon: '🏦', bg: 'rgba(61,145,244,0.15)', color: '#3D91F4' },
  Other:         { icon: '📌', bg: 'rgba(255,255,255,0.08)', color: '#B3B3B3' },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

let transactions = [
  { id: 1, name: 'Grocery Shopping',   category: 'Food',          amount: 3200,   type: 'expense', date: '2025-03-20' },
  { id: 2, name: 'Monthly Salary',      category: 'Salary',        amount: 45000,  type: 'income',  date: '2025-03-01' },
  { id: 3, name: 'Rent Payment',        category: 'Rent',          amount: 12600,  type: 'expense', date: '2025-03-05' },
  { id: 4, name: 'Savings Deposit',     category: 'Savings',       amount: 5000,   type: 'expense', date: '2025-03-10' },
  { id: 5, name: 'Electricity Bill',    category: 'Bills',         amount: 1800,   type: 'expense', date: '2025-03-08' },
  { id: 6, name: 'Swiggy Order',        category: 'Food',          amount: 540,    type: 'expense', date: '2025-03-18' },
  { id: 7, name: 'Metro Card Recharge', category: 'Transport',     amount: 500,    type: 'expense', date: '2025-03-12' },
  { id: 8, name: 'Netflix Subscription',category: 'Entertainment', amount: 649,    type: 'expense', date: '2025-03-15' },
  { id: 9, name: 'Amazon Shopping',     category: 'Shopping',      amount: 2300,   type: 'expense', date: '2025-03-17' },
  { id:10, name: 'Freelance Payment',   category: 'Salary',        amount: 8000,   type: 'income',  date: '2025-03-22' },
];

let nextId = 11;
let donutChartInst = null;
let lineChartInst  = null;
let currentRange   = '6m';
let currentPage    = 'dashboard';

// ── HELPERS ─────────────────────────────────────────
const fmt = n => '₹' + n.toLocaleString('en-IN');
const fmtShort = n => n >= 100000 ? '₹' + (n/100000).toFixed(1) + 'L'
                    : n >= 1000   ? '₹' + (n/1000).toFixed(1) + 'K'
                    : '₹' + n;

function fmtDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── NAVIGATION ───────────────────────────────────────
function navigate(page) {
  currentPage = page;

  // sidebar active state
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // page title
  const titles = {
    dashboard: 'Dashboard', transactions: 'Transactions',
    accounts: 'Accounts', reports: 'Reports',
    goals: 'Goals', settings: 'Settings'
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;

  // show/hide pages
  document.querySelectorAll('.page-content').forEach(el => {
    el.classList.toggle('hidden', el.id !== 'page-' + page);
  });

  // lazy-render transactions full list
  if (page === 'transactions') renderFullTxnList();
}

// ── RENDER TRANSACTIONS (DASHBOARD) ─────────────────
function renderRecentTxns() {
  const list = document.getElementById('txnList');
  const recent = [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  list.innerHTML = recent.map(t => txnHTML(t)).join('');
}

function txnHTML(t) {
  const cat = CATEGORY_ICONS[t.category] || CATEGORY_ICONS.Other;
  const sign = t.type === 'expense' ? '-' : '+';
  const cls  = t.type === 'expense' ? 'debit' : 'credit';
  return `
    <div class="txn-item" data-id="${t.id}">
      <div class="txn-icon" style="background:${cat.bg}; font-size:1rem;">${cat.icon}</div>
      <div class="txn-info">
        <div class="txn-name">${t.name}</div>
        <div class="txn-date">${fmtDate(t.date)} · ${t.category}</div>
      </div>
      <div class="txn-amount ${cls}">${sign}${fmt(t.amount)}</div>
    </div>`;
}

// ── RENDER TRANSACTIONS (FULL PAGE) ─────────────────
function renderFullTxnList(filter = 'all', query = '') {
  const list = document.getElementById('txnListFull');
  let txns = [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date));
  if (filter !== 'all') txns = txns.filter(t => t.type === filter);
  if (query.trim()) {
    const q = query.toLowerCase();
    txns = txns.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  }
  list.innerHTML = txns.length
    ? txns.map(t => txnHTML(t)).join('')
    : `<div style="padding:32px;text-align:center;color:var(--text-muted);">No transactions found</div>`;
}

// ── DONUT CHART ──────────────────────────────────────
const SPENDING_COLORS = ['#1DB954','#3D91F4','#FFA42B','#BC5FFF','#E91429','#00C8FF','#FF6B6B','#4FFFB0'];

function buildDonut() {
  const expTxns = transactions.filter(t => t.type === 'expense');
  const byCategory = {};
  expTxns.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(byCategory);
  const data   = Object.values(byCategory);
  const colors = labels.map((_, i) => SPENDING_COLORS[i % SPENDING_COLORS.length]);

  // Legend
  const legend = document.getElementById('donutLegend');
  legend.innerHTML = labels.map((l, i) => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${colors[i]}"></div>
      <span>${l}</span>
    </div>`).join('');

  if (donutChartInst) donutChartInst.destroy();

  const ctx = document.getElementById('donutChart').getContext('2d');
  donutChartInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#181818',
        borderWidth: 3,
        hoverBorderWidth: 0,
        hoverOffset: 6,
      }]
    },
    options: {
      cutout: '68%',
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: '#282828',
        titleColor: '#fff',
        bodyColor: '#B3B3B3',
        padding: 10,
        cornerRadius: 8,
        callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)}` }
      }},
      animation: { animateRotate: true, duration: 700 }
    }
  });
}

// ── LINE CHART ───────────────────────────────────────
function getLineData(range) {
  const monthsMap = { '6m': 6, '3m': 3, '1m': 1 };
  const n = monthsMap[range] || 6;
  const now = new Date();
  const labels = [];
  const income = [];
  const expense = [];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(MONTHS[d.getMonth()]);
    // Simulate data (replace with real backend data)
    const seed = d.getMonth() + d.getFullYear();
    income.push(35000 + Math.sin(seed) * 12000 + i * 1200);
    expense.push(20000 + Math.cos(seed) * 8000 + i * 600);
  }
  return { labels, income, expense };
}

function buildLine(range = '6m') {
  const { labels, income, expense } = getLineData(range);

  if (lineChartInst) lineChartInst.destroy();

  const ctx = document.getElementById('lineChart').getContext('2d');

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, 'rgba(29,185,84,0.2)');
  grad.addColorStop(1, 'rgba(29,185,84,0)');

  lineChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: income,
          borderColor: '#1DB954',
          backgroundColor: grad,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1DB954',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5,
        },
        {
          label: 'Expenses',
          data: expense,
          borderColor: '#E91429',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#E91429',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: '#B3B3B3',
            font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
          }
        },
        tooltip: {
          backgroundColor: '#282828',
          titleColor: '#fff',
          bodyColor: '#B3B3B3',
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmt(Math.round(ctx.raw))}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#535353', font: { family: 'Plus Jakarta Sans', size: 11 } },
          border: { color: 'transparent' }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#535353',
            font: { family: 'JetBrains Mono', size: 10 },
            callback: v => fmtShort(v)
          },
          border: { color: 'transparent' }
        }
      }
    }
  });
}

// ── ADD TRANSACTION ──────────────────────────────────
function openModal() {
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('f-date').value = new Date().toISOString().split('T')[0];
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  ['f-desc','f-amount'].forEach(id => document.getElementById(id).value = '');
}

function addTransaction() {
  const desc   = document.getElementById('f-desc').value.trim();
  const amount = parseFloat(document.getElementById('f-amount').value);
  const type   = document.getElementById('f-type').value;
  const cat    = document.getElementById('f-category').value;
  const date   = document.getElementById('f-date').value;

  if (!desc || !amount || amount <= 0) {
    alert('Please fill in description and a valid amount.');
    return;
  }

  transactions.unshift({ id: nextId++, name: desc, category: cat, amount, type, date });
  closeModal();
  refresh();
}

// ── REFRESH ALL ──────────────────────────────────────
function refresh() {
  renderRecentTxns();
  buildDonut();
  buildLine(currentRange);
  if (currentPage === 'transactions') renderFullTxnList();
}

// ── EVENTS ───────────────────────────────────────────
function bindEvents() {
  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigate(el.dataset.page);
    });
  });

  // Card "See all" → transactions
  document.querySelectorAll('.card-link[data-nav]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigate(el.dataset.nav);
    });
  });

  // Chart tabs
  document.querySelectorAll('.chart-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRange = btn.dataset.range;
      buildLine(currentRange);
    });
  });

  // Quick action: Add Transaction
  document.getElementById('addTxnBtn').addEventListener('click', openModal);
  document.getElementById('openAddModal')?.addEventListener('click', openModal);

  // Modal close
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // Submit transaction
  document.getElementById('submitTxn').addEventListener('click', addTransaction);

  // Transaction filter/search
  document.getElementById('txnFilter')?.addEventListener('change', e => {
    const q = document.getElementById('txnSearch').value;
    renderFullTxnList(e.target.value, q);
  });
  document.getElementById('txnSearch')?.addEventListener('input', e => {
    const f = document.getElementById('txnFilter').value;
    renderFullTxnList(f, e.target.value);
  });

  // Keyboard shortcut: Escape closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

// ── INIT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  navigate('dashboard');
  refresh();
});