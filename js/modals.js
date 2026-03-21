/* =====================================================
   modals.js — Modal open / close / submit handlers
   Depends on: data.js, ui.js, charts.js
   ===================================================== */

// ─── ADD TRANSACTION MODAL ──────────────────────────────

function openModal() {
  document.getElementById('fDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('fDesc').focus();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.getElementById('fDesc').value   = '';
  document.getElementById('fAmount').value = '';
}

function submitTransaction() {
  const desc   = document.getElementById('fDesc').value.trim();
  const amt    = parseFloat(document.getElementById('fAmount').value);
  const type   = document.getElementById('fType').value;
  const cat    = document.getElementById('fCategory').value;
  const date   = document.getElementById('fDate').value;

  if (!desc || !amt || amt <= 0) {
    showToast('Please fill in description and a valid amount.', 'error');
    return;
  }

  // Add to the top of the transactions array
  transactions.unshift({ id: nextTxnId++, name: desc, cat, amt, type, date });

  closeModal();

  // Refresh every surface that shows transaction data
  renderDashboard();
  buildDonut();
  buildLine('6m');

  // Also refresh the transactions page list if it's currently visible
  if (document.getElementById('page-transactions').classList.contains('active')) {
    renderFullTxns();
  }

  showToast(`"${desc}" added successfully!`, 'success');
}


// ─── ADD GOAL MODAL ─────────────────────────────────────

function openGoalModal() {
  document.getElementById('goalModal').classList.remove('hidden');
  document.getElementById('gName').focus();
}

function closeGoalModal() {
  document.getElementById('goalModal').classList.add('hidden');
  ['gName', 'gTarget', 'gSaved'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

function submitGoal() {
  const name     = document.getElementById('gName').value.trim();
  const target   = parseFloat(document.getElementById('gTarget').value);
  const saved    = parseFloat(document.getElementById('gSaved').value) || 0;
  const icon     = document.getElementById('gIcon').value;
  const deadline = document.getElementById('gDeadline').value || '2026-12';

  if (!name || !target || target <= 0) {
    showToast('Please fill in goal name and target amount.', 'error');
    return;
  }

  goals.push({
    id: nextGoalId++,
    name, icon, target, saved, deadline,
    color: GOAL_COLORS[goals.length % GOAL_COLORS.length],
  });

  closeGoalModal();
  renderGoals();
  showToast(`Goal "${name}" created!`, 'success');
}


// ─── BIND MODAL EVENTS ──────────────────────────────────

function bindModalEvents() {
  // Transaction modal — open buttons
  document.getElementById('topbarAddBtn')   ?.addEventListener('click', openModal);
  document.getElementById('txnPageAddBtn')  ?.addEventListener('click', openModal);
  document.getElementById('qaAddTxn')       ?.addEventListener('click', openModal);

  // Transaction modal — close & submit
  document.getElementById('modalClose')     ?.addEventListener('click', closeModal);
  document.getElementById('submitTxnBtn')   ?.addEventListener('click', submitTransaction);

  // Close transaction modal by clicking the backdrop
  document.getElementById('modalOverlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // Goal modal — open & close
  document.getElementById('addGoalBtn')     ?.addEventListener('click', openGoalModal);
  document.getElementById('goalModalClose') ?.addEventListener('click', closeGoalModal);
  document.getElementById('submitGoalBtn')  ?.addEventListener('click', submitGoal);

  // Close goal modal by clicking backdrop
  document.getElementById('goalModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('goalModal')) closeGoalModal();
  });

  // Settings — delete account row
  document.getElementById('deleteAccountRow')?.addEventListener('click', () => {
    showToast('Account deletion requires backend integration.', 'error');
  });

  // Escape key closes whichever modal is open
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeGoalModal();
    }
  });
}