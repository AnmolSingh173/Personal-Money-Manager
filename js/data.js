/* =====================================================
   data.js — App data, constants, shared helpers
   This file is loaded first. Everything else depends on it.
   ===================================================== */

// ─── CONSTANTS ─────────────────────────────────────────

/** Category metadata: icon, background tint, accent colour */
const CAT = {
  Food:          { icon: '🛒', bg: 'rgba(29,185,84,.13)',  c: '#1DB954' },
  Transport:     { icon: '🚌', bg: 'rgba(255,164,43,.13)', c: '#FFA42B' },
  Bills:         { icon: '💡', bg: 'rgba(61,145,244,.13)', c: '#3D91F4' },
  Salary:        { icon: '💼', bg: 'rgba(29,185,84,.13)',  c: '#1DB954' },
  Rent:          { icon: '🏠', bg: 'rgba(188,95,255,.13)', c: '#BC5FFF' },
  Entertainment: { icon: '🎬', bg: 'rgba(233,20,41,.13)',  c: '#E91429' },
  Shopping:      { icon: '🛍️', bg: 'rgba(255,164,43,.13)', c: '#FFA42B' },
  Savings:       { icon: '🏦', bg: 'rgba(61,145,244,.13)', c: '#3D91F4' },
  Other:         { icon: '📌', bg: 'rgba(255,255,255,.07)', c: '#B3B3B3' },
};

/** Chart colour palette */
const COLORS = [
  '#1DB954', '#3D91F4', '#FFA42B',
  '#BC5FFF', '#E91429', '#00C8FF',
  '#FF6B6B', '#4FFFB0',
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const GOAL_COLORS = ['green', 'orange', 'blue', 'purple'];

// ─── LIVE DATA ──────────────────────────────────────────

/** Transaction records — will be replaced by API calls once backend is ready */
let transactions = [
  { id: 1,  name: 'Monthly Salary',       cat: 'Salary',        amt: 45000, type: 'income',  date: '2025-03-01' },
  { id: 2,  name: 'Freelance Payment',    cat: 'Salary',        amt: 8000,  type: 'income',  date: '2025-03-22' },
  { id: 3,  name: 'Rent Payment',         cat: 'Rent',          amt: 12600, type: 'expense', date: '2025-03-05' },
  { id: 4,  name: 'Electricity Bill',     cat: 'Bills',         amt: 1800,  type: 'expense', date: '2025-03-08' },
  { id: 5,  name: 'Savings Deposit',      cat: 'Savings',       amt: 5000,  type: 'expense', date: '2025-03-10' },
  { id: 6,  name: 'Metro Card Recharge',  cat: 'Transport',     amt: 500,   type: 'expense', date: '2025-03-12' },
  { id: 7,  name: 'Netflix',              cat: 'Entertainment', amt: 649,   type: 'expense', date: '2025-03-15' },
  { id: 8,  name: 'Amazon Shopping',      cat: 'Shopping',      amt: 2300,  type: 'expense', date: '2025-03-17' },
  { id: 9,  name: 'Grocery Shopping',     cat: 'Food',          amt: 3200,  type: 'expense', date: '2025-03-20' },
  { id: 10, name: 'Swiggy Order',         cat: 'Food',          amt: 540,   type: 'expense', date: '2025-03-21' },
];

let nextTxnId = 11;

/** Goal records */
let goals = [
  { id: 1, name: 'Emergency Fund',  icon: '🏦', target: 200000, saved: 80000, deadline: '2025-12', color: 'green'  },
  { id: 2, name: 'Europe Trip',     icon: '✈️', target: 150000, saved: 42000, deadline: '2026-06', color: 'orange' },
  { id: 3, name: 'New Laptop',      icon: '💻', target: 85000,  saved: 62000, deadline: '2025-08', color: 'blue'   },
  { id: 4, name: 'Wedding Fund',    icon: '💍', target: 500000, saved: 75000, deadline: '2027-01', color: 'purple' },
];

let nextGoalId = 5;

// ─── SHARED HELPER FUNCTIONS ────────────────────────────

/** Format a number as Indian Rupees with commas:  45000 → ₹45,000 */
function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

/** Compact format for chart axes:  150000 → ₹1.5L,  3400 → ₹3.4K */
function fmtShort(n) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)   return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + n;
}

/** Format a date string to "20 Mar" style */
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** Calculate income, expense, and balance totals from the transactions array */
function calcTotals() {
  const inc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amt, 0);
  const exp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amt, 0);
  return { inc, exp, bal: inc - exp };
}

/** Build the spending-by-category map from expense transactions */
function spendingByCategory() {
  const map = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => { map[t.cat] = (map[t.cat] || 0) + t.amt; });
  return map;
}