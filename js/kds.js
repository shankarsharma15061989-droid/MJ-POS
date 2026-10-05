/* ==========================================================================
   AuraPOS Kitchen Display System (KDS) Module
   ========================================================================== */

class KDSModule {
  constructor(appState) {
    this.appState = appState;
    this.statusFilter = 'all'; // 'all' | 'pending' | 'preparing' | 'ready'
  }

  init() {
    this.render();
    this.bindEvents();

    // Auto increment elapsed time timer every minute
    setInterval(() => {
      this.appState.kitchenTickets.forEach(t => {
        t.elapsedMinutes += 1;
        if (t.elapsedMinutes >= 15) t.urgent = true;
      });
      this.render();
    }, 60000);
  }

  bindEvents() {
    document.querySelectorAll('.kds-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        window.soundEngine.play('click');
        this.statusFilter = e.currentTarget.dataset.status;
        this.render();
      });
    });
  }

  render() {
    const grid = document.getElementById('kds-grid');
    if (!grid) return;

    let tickets = this.appState.kitchenTickets;
    if (this.statusFilter !== 'all') {
      tickets = tickets.filter(t => t.status === this.statusFilter);
    }

    // Update count badges
    const totalCount = document.getElementById('kds-total-count');
    if (totalCount) totalCount.innerText = this.appState.kitchenTickets.length;

    if (tickets.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-dim);">
          <svg style="width:54px;height:54px;margin-bottom:12px;opacity:0.3;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"/></svg>
          <h3 style="font-family:var(--font-heading);font-size:1.2rem;margin-bottom:4px;color:var(--text-muted);">Kitchen Queue is Clear!</h3>
          <p>No pending kitchen orders right now.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = tickets.map(ticket => `
      <div class="kds-ticket ${ticket.urgent ? 'urgent' : ''}" data-id="${ticket.id}">
        <div class="kds-ticket-header ${ticket.urgent ? 'urgent' : ''}">
          <div>
            <div class="ticket-number">${ticket.id} (${ticket.tableNumber})</div>
            <div style="font-size:0.75rem;opacity:0.8;">Server: ${ticket.server} | Sent: ${ticket.timeSent}</div>
          </div>
          <div class="ticket-timer">⏱️ ${ticket.elapsedMinutes}m</div>
        </div>
        <div class="kds-ticket-body">
          ${ticket.items.map(item => `
            <div>
              <div class="kds-item-row">
                <span><strong class="kds-item-qty">${item.qty}x</strong> ${item.name}</span>
              </div>
              ${item.mods && item.mods.length > 0 ? `
                <div class="kds-item-mods">⚠️ ${item.mods.join(', ')}</div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        <div class="kds-ticket-footer">
          ${ticket.status === 'pending' ? `
            <button class="kds-btn bump kds-start-btn" data-id="${ticket.id}">Start Prep</button>
          ` : ticket.status === 'preparing' ? `
            <button class="kds-btn ready kds-ready-btn" data-id="${ticket.id}">Mark Ready</button>
          ` : `
            <button class="kds-btn bump kds-bump-btn" data-id="${ticket.id}">Bump / Complete</button>
          `}
        </div>
      </div>
    `).join('');

    // Ticket Action Listeners
    grid.querySelectorAll('.kds-start-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const t = this.appState.kitchenTickets.find(x => x.id === id);
        if (t) {
          t.status = 'preparing';
          window.soundEngine.play('click');
          this.render();
        }
      });
    });

    grid.querySelectorAll('.kds-ready-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const t = this.appState.kitchenTickets.find(x => x.id === id);
        if (t) {
          t.status = 'ready';
          window.soundEngine.play('kitchen');
          this.appState.showToast(`Order ${t.orderId} is Ready to Serve!`, 'success');
          this.render();
        }
      });
    });

    grid.querySelectorAll('.kds-bump-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const idx = this.appState.kitchenTickets.findIndex(x => x.id === id);
        if (idx >= 0) {
          this.appState.kitchenTickets.splice(idx, 1);
          window.soundEngine.play('click');
          this.appState.showToast(`Order bumped from Kitchen Display`, 'info');
          this.render();
        }
      });
    });
  }
}

window.KDSModule = KDSModule;
