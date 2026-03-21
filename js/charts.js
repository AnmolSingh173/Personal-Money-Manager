/* =====================================================
   charts.js — All Chart.js chart builders
   Depends on: data.js (fmt, fmtShort, COLORS, MONTHS, transactions)
   ===================================================== */

// ─── CHART INSTANCES (kept to allow destroy on rebuild) ─
let donutInst    = null;
let lineInst     = null;
let balanceInst  = null;
let repDonutInst = null;
let repBarInst   = null;

// ─── SHARED CHART DEFAULTS ──────────────────────────────

/** Tooltip style applied to every chart */
const TOOLTIP_STYLE = {
  backgroundColor: '#282828',
  titleColor: '#fff',
  bodyColor: '#B3B3B3',
  padding: 10,
  cornerRadius: 8,
};

/** Axis tick style */
const TICK_X = { color: '#535353', font: { size: 10 } };
const TICK_Y = { color: '#535353', font: { family: 'JetBrains Mono', size: 10 }, callback: v => fmtShort(v) };
const GRID   = { color: 'rgba(255,255,255,.04)' };
const BORDER_HIDDEN = { color: 'transparent' };


// ─── DASHBOARD — DONUT CHART ────────────────────────────

function buildDonut() {
  const byC    = spendingByCategory();
  const labels = Object.keys(byC);
  const data   = Object.values(byC);
  const colors = labels.map((_, i) => COLORS[i % COLORS.length]);
  const total  = data.reduce((s, v) => s + v, 0);

  // Update centre label
  document.getElementById('donutTtl').textContent = fmtShort(total);

  // Update legend
  document.getElementById('donutLegend').innerHTML = labels.map((l, i) =>
    `<div class="leg-item">
       <div class="leg-dot" style="background:${colors[i]}"></div>
       <span>${l}</span>
     </div>`
  ).join('');

  if (donutInst) donutInst.destroy();

  donutInst = new Chart(
    document.getElementById('donutChart').getContext('2d'),
    {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: '#181818',
          borderWidth: 3,
          hoverOffset: 5,
        }],
      },
      options: {
        cutout: '66%',
        plugins: {
          legend:  { display: false },
          tooltip: {
            ...TOOLTIP_STYLE,
            callbacks: { label: c => ` ${c.label}: ${fmt(c.raw)}` },
          },
        },
        animation: { animateRotate: true, duration: 600 },
      },
    }
  );
}


// ─── DASHBOARD — LINE CHART ─────────────────────────────

function buildLine(range = '6m') {
  const n = { '6m': 6, '3m': 3, '1m': 1 }[range] || 6;
  const now = new Date();
  const labels = [], incData = [], expData = [];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(MONTHS[d.getMonth()]);
    // Simulated data — swap these lines for real API data later
    const s = d.getMonth() + d.getFullYear() * 0.01;
    incData.push(35000 + Math.sin(s) * 11000 + i * 900);
    expData.push(20000 + Math.cos(s) * 7000  + i * 400);
  }

  if (lineInst) lineInst.destroy();

  const ctx  = document.getElementById('lineChart').getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, 'rgba(29,185,84,.18)');
  grad.addColorStop(1, 'rgba(29,185,84,0)');

  lineInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incData,
          borderColor: '#1DB954',
          backgroundColor: grad,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1DB954',
          pointRadius: 4, pointHoverRadius: 6,
          borderWidth: 2.5,
        },
        {
          label: 'Expenses',
          data: expData,
          borderColor: '#E91429',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#E91429',
          pointRadius: 4, pointHoverRadius: 6,
          borderWidth: 2.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true, position: 'top', align: 'end',
          labels: {
            color: '#B3B3B3',
            font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
            boxWidth: 8, usePointStyle: true, pointStyle: 'circle', padding: 14,
          },
        },
        tooltip: {
          ...TOOLTIP_STYLE,
          callbacks: { label: c => ` ${c.dataset.label}: ${fmt(Math.round(c.raw))}` },
        },
      },
      scales: {
        x: { grid: GRID, ticks: TICK_X, border: BORDER_HIDDEN },
        y: { grid: GRID, ticks: TICK_Y, border: BORDER_HIDDEN },
      },
    },
  });
}


// ─── ACCOUNTS — BALANCE TREND CHART ────────────────────

function buildBalanceChart() {
  if (balanceInst) balanceInst.destroy();

  const ctx  = document.getElementById('balanceChart').getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 150);
  grad.addColorStop(0, 'rgba(29,185,84,.2)');
  grad.addColorStop(1, 'rgba(29,185,84,0)');

  balanceInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MONTHS.slice(0, 6),
      datasets: [{
        label: 'Balance',
        data: [90000, 105000, 98000, 120000, 135000, 150000],
        borderColor: '#1DB954',
        backgroundColor: grad,
        fill: true, tension: 0.4,
        pointBackgroundColor: '#1DB954',
        pointRadius: 3, borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend:  { display: false },
        tooltip: {
          ...TOOLTIP_STYLE,
          callbacks: { label: c => ` ${fmt(c.raw)}` },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: TICK_X, border: BORDER_HIDDEN },
        y: { grid: GRID, ticks: TICK_Y, border: BORDER_HIDDEN },
      },
    },
  });
}


// ─── REPORTS — PIE CHART ────────────────────────────────

function buildReportDonut() {
  const { inc, exp, bal } = calcTotals();

  if (repDonutInst) repDonutInst.destroy();

  repDonutInst = new Chart(
    document.getElementById('reportDonut').getContext('2d'),
    {
      type: 'doughnut',
      data: {
        labels: ['Income', 'Expenses', 'Savings'],
        datasets: [{
          data: [inc, exp, Math.max(0, bal)],
          backgroundColor: ['#1DB954', '#E91429', '#3D91F4'],
          borderColor: '#181818',
          borderWidth: 3,
          hoverOffset: 5,
        }],
      },
      options: {
        cutout: '62%',
        plugins: {
          legend:  { display: false },
          tooltip: {
            ...TOOLTIP_STYLE,
            callbacks: { label: c => ` ${c.label}: ${fmt(c.raw)}` },
          },
        },
      },
    }
  );
}


// ─── REPORTS — GROUPED BAR CHART ────────────────────────

function buildReportBar() {
  if (repBarInst) repBarInst.destroy();

  repBarInst = new Chart(
    document.getElementById('reportBar').getContext('2d'),
    {
      type: 'bar',
      data: {
        labels: MONTHS.slice(0, 6),
        datasets: [
          { label: 'Food',  data: [2800,3100,2600,3400,2900,3200], backgroundColor: 'rgba(29,185,84,.7)',  borderRadius: 4 },
          { label: 'Bills', data: [1800,1800,2100,1900,1800,1800], backgroundColor: 'rgba(61,145,244,.7)', borderRadius: 4 },
          { label: 'Rent',  data: [12600,12600,12600,12600,12600,12600], backgroundColor: 'rgba(188,95,255,.7)', borderRadius: 4 },
          { label: 'Other', data: [3200,2800,4100,3600,3100,2900], backgroundColor: 'rgba(255,164,43,.7)', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true, position: 'top', align: 'end',
            labels: {
              color: '#B3B3B3', font: { size: 11 },
              boxWidth: 10, usePointStyle: true, pointStyle: 'rectRounded', padding: 12,
            },
          },
          tooltip: {
            ...TOOLTIP_STYLE,
            callbacks: { label: c => ` ${c.dataset.label}: ${fmt(c.raw)}` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: TICK_X, border: BORDER_HIDDEN },
          y: { grid: GRID, ticks: TICK_Y, border: BORDER_HIDDEN },
        },
      },
    }
  );
}