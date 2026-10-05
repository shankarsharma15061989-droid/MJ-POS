/* ==========================================================================
   AuraPOS Main Orchestrator & Application Controller (INR Currency)
   ========================================================================== */

class App {
  constructor() {
    this.currentUser = INITIAL_STAFF[1]; // Sarah Jenkins (Cashier)
    this.menuItems = INITIAL_MENU_ITEMS;
    this.tables = INITIAL_TABLES;
    this.kitchenTickets = INITIAL_KITCHEN_TICKETS;
    this.transactions = [
      {
        id: 'ORD-1035',
        date: new Date().toLocaleDateString(),
        time: '13:10',
        tableNumber: 'VIP Suite A',
        server: 'Sarah Jenkins',
        items: [{ name: 'Prime Grilled Ribeye Steak', qty: 4, unitPrice: 850.00, modifiers: [] }],
        subtotal: 3400.00,
        discount: 0,
        tax: 170.00,
        tip: 0,
        total: 3570.00,
        paymentMethod: 'CARD',
        cashTendered: 3570.00,
        changeReturned: 0
      }
    ];
    this.heldOrders = [];
    this.settings = DEFAULT_SETTINGS;
    this.enteredPin = '';

    // Modules
    this.registerModule = null;
    this.floorplanModule = null;
    this.kdsModule = null;
    this.paymentModule = null;
    this.inventoryModule = null;
    this.analyticsModule = null;
  }

  init() {
    this.initClock();
    this.initModules();
    this.bindGlobalEvents();
    this.updateUserPill();
  }

  initClock() {
    const timeEl = document.getElementById('live-clock-time');
    const dateEl = document.getElementById('live-clock-date');

    const update = () => {
      const now = new Date();
      if (timeEl) timeEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (dateEl) dateEl.innerText = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    update();
    setInterval(update, 1000);
  }

  initModules() {
    this.registerModule = new RegisterModule(this);
    this.registerModule.init();

    this.floorplanModule = new FloorPlanModule(this);
    this.floorplanModule.init();

    this.kdsModule = new KDSModule(this);
    this.kdsModule.init();

    this.paymentModule = new PaymentModule(this);

    this.inventoryModule = new InventoryModule(this);
    this.inventoryModule.init();

    this.analyticsModule = new AnalyticsModule(this);
    this.analyticsModule.init();
  }

  bindGlobalEvents() {
    // Nav Tab Switcher
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        window.soundEngine.play('click');
        this.switchTab(tab);
      });
    });

    // Audio Mute toggle
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isMuted = window.soundEngine.toggleMute();
        audioBtn.style.opacity = isMuted ? '0.4' : '1';
        this.showToast(isMuted ? 'Sound FX Muted' : 'Sound FX Enabled', 'info');
      });
    }

    // Lock PIN screen button
    const lockBtn = document.getElementById('pin-lock-btn');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => this.showPinLock());
    }

    // Staff Avatar pill switch user
    const staffPill = document.getElementById('staff-profile-pill');
    if (staffPill) {
      staffPill.addEventListener('click', () => this.showPinLock());
    }

    // PIN Pad Keys
    document.querySelectorAll('.pin-key').forEach(key => {
      key.addEventListener('click', (e) => {
        const val = e.currentTarget.dataset.val;
        this.handlePinKey(val);
      });
    });
  }

  switchTab(tabId) {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${tabId}`);
    });

    // Trigger tab-specific refresh logic
    if (tabId === 'register' && this.registerModule) {
      this.registerModule.renderDishes();
    } else if (tabId === 'floorplan' && this.floorplanModule) {
      this.floorplanModule.renderTables();
    } else if (tabId === 'kds' && this.kdsModule) {
      this.kdsModule.render();
    } else if (tabId === 'inventory' && this.inventoryModule) {
      this.inventoryModule.render();
    } else if (tabId === 'analytics' && this.analyticsModule) {
      this.analyticsModule.renderMetrics();
      this.analyticsModule.renderCharts();
    }
  }

  showPinLock() {
    this.enteredPin = '';
    this.updatePinDots();
    document.getElementById('pin-lock-overlay').classList.add('active');
  }

  handlePinKey(val) {
    window.soundEngine.play('click');
    if (val === 'clear') {
      this.enteredPin = '';
    } else if (val === 'back') {
      this.enteredPin = this.enteredPin.slice(0, -1);
    } else if (this.enteredPin.length < 4) {
      this.enteredPin += val;
    }

    this.updatePinDots();

    if (this.enteredPin.length === 4) {
      setTimeout(() => this.verifyPin(), 100);
    }
  }

  updatePinDots() {
    document.querySelectorAll('.pin-dot').forEach((dot, idx) => {
      dot.classList.toggle('filled', idx < this.enteredPin.length);
    });
  }

  verifyPin() {
    const staff = INITIAL_STAFF.find(s => s.pin === this.enteredPin);
    if (staff) {
      this.currentUser = staff;
      this.updateUserPill();
      window.soundEngine.play('kaching');
      document.getElementById('pin-lock-overlay').classList.remove('active');
      this.showToast(`Welcome back, ${staff.name} (${staff.role})`, 'success');
    } else {
      window.soundEngine.play('error');
      this.showToast('Invalid PIN Code! Try 1234 (Cashier) or 9999 (Manager)', 'warning');
      this.enteredPin = '';
      this.updatePinDots();
    }
  }

  updateUserPill() {
    const avatar = document.getElementById('user-avatar');
    const name = document.getElementById('user-name');
    const role = document.getElementById('user-role');

    if (avatar) avatar.innerText = this.currentUser.avatar;
    if (name) name.innerText = this.currentUser.name;
    if (role) role.innerText = this.currentUser.role;
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
