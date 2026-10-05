/* ==========================================================================
   AuraPOS Floor Plan & Table Management Module
   ========================================================================== */

class FloorPlanModule {
  constructor(appState) {
    this.appState = appState;
    this.activeZone = 'all'; // 'all' | 'main' | 'patio' | 'bar' | 'vip'
  }

  init() {
    this.renderZones();
    this.renderTables();
    this.bindEvents();
  }

  bindEvents() {
    document.querySelectorAll('.zone-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        window.soundEngine.play('click');
        this.activeZone = e.currentTarget.dataset.zone;
        this.renderZones();
        this.renderTables();
      });
    });
  }

  renderZones() {
    document.querySelectorAll('.zone-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.zone === this.activeZone);
    });
  }

  renderTables() {
    const grid = document.getElementById('floor-map-grid');
    if (!grid) return;

    let tables = this.appState.tables;
    if (this.activeZone !== 'all') {
      tables = tables.filter(t => t.zone === this.activeZone);
    }

    grid.innerHTML = tables.map(table => `
      <div class="table-card status-${table.status}" data-id="${table.id}">
        <div class="table-header">
          <span class="table-number">${table.number}</span>
          <span class="table-seats-pill">👥 ${table.seats} Seats</span>
        </div>
        <div class="table-status-pill">
          ${table.status.toUpperCase()}
        </div>
        <div class="table-footer">
          <span>${table.currentOrder ? `Order: ${table.currentOrder.id}` : 'Empty'}</span>
          <span class="table-timer">${table.timeElapsed ? `⏱️ ${table.timeElapsed}` : ''}</span>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.table-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const tableId = card.dataset.id;
        this.handleTableClick(tableId);
      });
    });
  }

  handleTableClick(tableId) {
    const table = this.appState.tables.find(t => t.id === tableId);
    if (!table) return;

    window.soundEngine.play('click');

    // Action menu prompt
    const actions = ['1. Open / Start Order', '2. Request Bill', '3. Mark Available / Clean', '4. Mark Reserved'];
    const choice = prompt(
      `Table: ${table.number} (${table.seats} Seats) - Status: ${table.status.toUpperCase()}\n\nSelect Action:\n${actions.join('\n')}`,
      '1'
    );

    if (choice === '1') {
      table.status = 'occupied';
      if (!table.timeElapsed) table.timeElapsed = '1m';
      
      // Assign to current register ticket
      this.appState.registerModule.currentTicket.tableId = table.id;
      this.appState.registerModule.currentTicket.tableNumber = table.number;
      this.appState.registerModule.currentTicket.orderType = 'dine-in';
      this.appState.registerModule.renderCart();

      this.appState.showToast(`Assigned ${table.number} to Register Ticket`, 'success');
      this.appState.switchTab('register');
    } else if (choice === '2') {
      table.status = 'bill';
      this.appState.showToast(`Bill requested for ${table.number}`, 'info');
    } else if (choice === '3') {
      table.status = 'available';
      table.currentOrder = null;
      table.timeElapsed = null;
      this.appState.showToast(`${table.number} marked Available`, 'success');
    } else if (choice === '4') {
      table.status = 'reserved';
      table.timeElapsed = 'Res: 8:00 PM';
      this.appState.showToast(`${table.number} marked Reserved`, 'warning');
    }

    this.renderTables();
  }
}

window.FloorPlanModule = FloorPlanModule;
