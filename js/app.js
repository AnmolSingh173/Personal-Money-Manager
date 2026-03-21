/* =====================================================
   app.js — Navigation router & application entry point
   Loaded last. Depends on: data.js, charts.js, ui.js, modals.js
   ===================================================== */

// ─── PAGE TITLES ────────────────────────────────────────

const PAGE_TITLES = {
  dashboard:    'Dashboard',
  transactions: 'Transactions',
  accounts:     'Accounts',
  reports:      'Reports',
  goals:        'Goals',
  settings:     'Settings',
};


// ─── NAVIGATION ─────────────────────────────────────────

/**
 * Switch the visible page and trigger its lazy render.
 * Called by sidebar items, quick-action buttons, and "See all" links.
 * @param {string} page - one of the keys in PAGE_TITLES
 */
function navigate(page) {
  // 1. Update sidebar active state
  document.querySelectorAll('.sb-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // 2. Update page title in topbar
  document.getElementById('pageTitle').textContent = PAGE_TITLES[page] || page;

  // 3. Show/hide page panels
  document.querySelectorAll('.page').forEach(el => {
    el.classList.toggle('active', el.id === 'page-' + page);
  });

  // 4. Lazy-build charts / render content for the newly visible page
  switch (page) {
    case 'dashboard':
      renderDashboard();
      buildDonut();
      buildLine('6m');
      break;

    case 'transactions':
      renderFullTxns();
      break;

    case 'accounts':
      renderAccountTxns();
      buildBalanceChart();
      break;

    case 'reports':
      renderReportBars();
      buildReportDonut();
      buildReportBar();
      break;

    case 'goals':
      renderGoals();
      break;

    // settings — pure static HTML, nothing to render
  }
}


// ─── BIND NAVIGATION EVENTS ─────────────────────────────

function bindNavEvents() {
  // Sidebar items
  document.querySelectorAll('.sb-item').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.page));
  });

  // Any element with data-nav attribute (Quick Action buttons, "See all" links)
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.nav));
  });

  // Line chart time-range tabs
  document.querySelectorAll('.ctab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      buildLine(btn.dataset.r);
    });
  });

  // Transaction page — live filter events
  document.getElementById('txnSearch')    ?.addEventListener('input',  filterTxns);
  document.getElementById('txnTypeFilter')?.addEventListener('change', filterTxns);
  document.getElementById('txnCatFilter') ?.addEventListener('change', filterTxns);
}


// ─── BOOT ───────────────────────────────────────────────

/**
 * Application entry point — runs once the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
  bindNavEvents();   // wire up all navigation clicks
  bindModalEvents(); // wire up all modal open/close/submit (from modals.js)
  navigate('dashboard'); // load the default page
});