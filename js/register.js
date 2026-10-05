/* ==========================================================================
   AuraPOS Register & Order Management Module (INR Currency)
   ========================================================================== */

class RegisterModule {
  constructor(appState) {
    this.appState = appState;
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.activeDietFilter = null;
    this.selectedItemForMod = null;
    this.currentModSelection = {};

    // Current Ticket Cart
    this.currentTicket = {
      orderId: this.generateOrderId(),
      orderType: 'dine-in', // 'dine-in' | 'takeout' | 'delivery'
      tableId: null,
      tableNumber: 'Select Table',
      items: [],
      discountPercent: 0,
      discountFixed: 0,
      tipPercent: 0,
      tipFixed: 0,
      notes: ''
    };
  }

  generateOrderId() {
    return 'ORD-' + Math.floor(1000 + Math.random() * 9000);
  }

  init() {
    this.renderCategories();
    this.renderDishes();
    this.renderCart();
    this.bindEvents();
  }

  bindEvents() {
    // Search listener
    const searchInput = document.getElementById('pos-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderDishes();
      });
    }

    // Order type buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        this.setOrderType(type);
      });
    });

    // Discount & Tip buttons
    const applyDiscountBtn = document.getElementById('apply-discount-btn');
    if (applyDiscountBtn) {
      applyDiscountBtn.addEventListener('click', () => this.promptDiscountModal());
    }

    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => this.clearCart());
    }

    const holdOrderBtn = document.getElementById('hold-order-btn');
    if (holdOrderBtn) {
      holdOrderBtn.addEventListener('click', () => this.holdOrder());
    }

    const sendKdsBtn = document.getElementById('send-kds-btn');
    if (sendKdsBtn) {
      sendKdsBtn.addEventListener('click', () => this.sendToKitchen());
    }

    const checkoutBtn = document.getElementById('pay-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.openPaymentModal());
    }
  }

  renderCategories() {
    const container = document.getElementById('categories-slider');
    if (!container) return;

    container.innerHTML = INITIAL_CATEGORIES.map(cat => `
      <button class="cat-btn ${this.currentCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
        <span class="cat-btn-icon">${cat.icon}</span>
        <span>${cat.name}</span>
      </button>
    `).join('');

    container.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        window.soundEngine.play('click');
        this.currentCategory = e.currentTarget.dataset.cat;
        this.renderCategories();
        this.renderDishes();
      });
    });
  }

  renderDishes() {
    const grid = document.getElementById('dishes-grid');
    if (!grid) return;

    let items = this.appState.menuItems;

    // Filter by Category
    if (this.currentCategory === 'specials') {
      items = items.filter(i => i.isSpecial);
    } else if (this.currentCategory !== 'all') {
      items = items.filter(i => i.category === this.currentCategory);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      items = items.filter(i => 
        i.name.toLowerCase().includes(this.searchQuery) ||
        i.description.toLowerCase().includes(this.searchQuery) ||
        i.tags.some(t => t.toLowerCase().includes(this.searchQuery))
      );
    }

    // Filter by Diet
    if (this.activeDietFilter) {
      items = items.filter(i => i.tags.includes(this.activeDietFilter));
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-dim);">
          <svg style="width:48px;height:48px;margin-bottom:12px;opacity:0.4;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <p style="font-weight:600;">No delicious items found matching "${this.searchQuery || this.currentCategory}"</p>
        </div>
      `;
      return;
    }

    const sym = this.appState.settings.currencySymbol || '₹';

    grid.innerHTML = items.map(item => `
      <div class="dish-card" data-id="${item.id}">
        <div class="dish-img-container">
          <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='assets/steak.jpg'" />
          <div class="stock-tag ${item.stock <= item.lowStockThreshold ? 'low' : ''}">
            ${item.stock > 0 ? `${item.stock} Left` : 'Sold Out'}
          </div>
        </div>
        <div class="dish-details">
          <div>
            <div class="dish-name">${item.name}</div>
            <div class="dish-desc">${item.description}</div>
          </div>
          <div class="dish-bottom">
            <div class="dish-price">${sym}${item.price.toFixed(2)}</div>
            <button class="add-btn" title="Add to Ticket">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.dish-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const itemId = card.dataset.id;
        this.handleAddItem(itemId);
      });
    });
  }

  handleAddItem(itemId) {
    const item = this.appState.menuItems.find(i => i.id === itemId);
    if (!item) return;

    if (item.stock <= 0) {
      window.soundEngine.play('warning');
      this.appState.showToast(`Sorry, "${item.name}" is sold out!`, 'warning');
      return;
    }

    // If item has modifiers, open customization modal
    if (item.modifiers && item.modifiers.length > 0) {
      this.openModifierModal(item);
    } else {
      this.addToCart(item, [], item.price);
    }
  }

  openModifierModal(item) {
    this.selectedItemForMod = item;
    this.currentModSelection = {};

    const modal = document.getElementById('modifier-modal');
    const container = document.getElementById('mod-body-container');
    const title = document.getElementById('mod-item-title');

    if (!modal || !container) return;

    title.innerText = `Customize: ${item.name}`;

    // Initialize required single selections with first option
    item.modifiers.forEach((grp, idx) => {
      if (grp.type === 'single') {
        this.currentModSelection[grp.name] = grp.options[0];
      } else {
        this.currentModSelection[grp.name] = [];
      }
    });

    this.renderModifierOptions();
    modal.classList.add('active');
  }

  renderModifierOptions() {
    const item = this.selectedItemForMod;
    const container = document.getElementById('mod-body-container');
    if (!item || !container) return;

    const sym = this.appState.settings.currencySymbol || '₹';

    container.innerHTML = item.modifiers.map(grp => `
      <div class="mod-group">
        <div class="mod-group-title">${grp.name} ${grp.required ? '<span style="color:var(--danger)">*</span>' : ''}</div>
        <div class="mod-options-grid">
          ${grp.options.map(opt => {
            let isSelected = false;
            if (grp.type === 'single') {
              isSelected = this.currentModSelection[grp.name]?.name === opt.name;
            } else {
              isSelected = (this.currentModSelection[grp.name] || []).some(o => o.name === opt.name);
            }
            return `
              <button class="mod-opt-btn ${isSelected ? 'selected' : ''}" 
                data-group="${grp.name}" 
                data-type="${grp.type}" 
                data-optname="${opt.name}"
                data-optprice="${opt.price}">
                ${opt.name} ${opt.price > 0 ? `(+${sym}${opt.price.toFixed(2)})` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.mod-opt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        window.soundEngine.play('click');
        const groupName = btn.dataset.group;
        const type = btn.dataset.type;
        const optName = btn.dataset.optname;
        const optPrice = parseFloat(btn.dataset.optprice);

        if (type === 'single') {
          this.currentModSelection[groupName] = { name: optName, price: optPrice };
        } else {
          const list = this.currentModSelection[groupName] || [];
          const existingIdx = list.findIndex(o => o.name === optName);
          if (existingIdx >= 0) {
            list.splice(existingIdx, 1);
          } else {
            list.push({ name: optName, price: optPrice });
          }
          this.currentModSelection[groupName] = list;
        }

        this.renderModifierOptions();
      });
    });

    // Confirm button event
    const confirmBtn = document.getElementById('mod-confirm-btn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        // Collect all chosen modifiers
        const selectedMods = [];
        let extraPrice = 0;

        Object.keys(this.currentModSelection).forEach(gName => {
          const val = this.currentModSelection[gName];
          if (Array.isArray(val)) {
            val.forEach(v => {
              selectedMods.push(v.name);
              extraPrice += v.price;
            });
          } else if (val && val.name) {
            selectedMods.push(val.name);
            extraPrice += val.price;
          }
        });

        this.addToCart(item, selectedMods, item.price + extraPrice);
        document.getElementById('modifier-modal').classList.remove('active');
      };
    }
  }

  addToCart(item, modifiers = [], unitPrice = item.price) {
    window.soundEngine.play('add');

    const modKey = modifiers.sort().join('|');
    const existingIndex = this.currentTicket.items.findIndex(
      i => i.id === item.id && i.modKey === modKey
    );

    if (existingIndex >= 0) {
      this.currentTicket.items[existingIndex].qty += 1;
    } else {
      this.currentTicket.items.push({
        id: item.id,
        name: item.name,
        basePrice: item.price,
        unitPrice: unitPrice,
        qty: 1,
        modifiers: modifiers,
        modKey: modKey
      });
    }

    this.renderCart();
  }

  renderCart() {
    const container = document.getElementById('cart-items-list');
    const tableInfo = document.getElementById('table-assigned-info');
    if (!container) return;

    if (tableInfo) {
      tableInfo.innerHTML = `
        <span>📍 ${this.currentTicket.orderType.toUpperCase()}: <strong>${this.currentTicket.tableNumber}</strong></span>
        <button id="change-table-btn" style="background:none;color:var(--primary);font-weight:700;font-size:0.8rem;text-decoration:underline;">Change</button>
      `;
      const changeBtn = document.getElementById('change-table-btn');
      if (changeBtn) {
        changeBtn.onclick = () => this.appState.switchTab('floorplan');
      }
    }

    if (this.currentTicket.items.length === 0) {
      container.innerHTML = `
        <div class="empty-cart-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          <p>No items on ticket yet.<br/>Select menu items to begin order.</p>
        </div>
      `;
      this.updateTotals(0, 0, 0, 0);
      return;
    }

    const sym = this.appState.settings.currencySymbol || '₹';

    container.innerHTML = this.currentTicket.items.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-main">
          <div>
            <div class="cart-item-name">${item.name}</div>
            ${item.modifiers.length > 0 ? `<div class="cart-item-mods">+ ${item.modifiers.join(', ')}</div>` : ''}
          </div>
          <div class="cart-item-price">${sym}${(item.unitPrice * item.qty).toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
          <div class="qty-stepper">
            <button class="step-btn decrease-qty" data-index="${idx}">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="step-btn increase-qty" data-index="${idx}">+</button>
          </div>
          <button class="remove-item-btn" data-index="${idx}" style="background:none;color:var(--danger);font-size:0.8rem;">Remove</button>
        </div>
      </div>
    `).join('');

    // Event listeners for quantity steppers
    container.querySelectorAll('.decrease-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        if (this.currentTicket.items[idx].qty > 1) {
          this.currentTicket.items[idx].qty -= 1;
        } else {
          this.currentTicket.items.splice(idx, 1);
        }
        window.soundEngine.play('click');
        this.renderCart();
      });
    });

    container.querySelectorAll('.increase-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        this.currentTicket.items[idx].qty += 1;
        window.soundEngine.play('click');
        this.renderCart();
      });
    });

    container.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        this.currentTicket.items.splice(idx, 1);
        window.soundEngine.play('warning');
        this.renderCart();
      });
    });

    this.calculateTotals();
  }

  calculateTotals() {
    const subtotal = this.currentTicket.items.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
    
    // Discount
    let discountAmount = 0;
    if (this.currentTicket.discountPercent > 0) {
      discountAmount = (subtotal * this.currentTicket.discountPercent) / 100;
    } else if (this.currentTicket.discountFixed > 0) {
      discountAmount = this.currentTicket.discountFixed;
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    // Tax (GST)
    const taxRate = this.appState.settings.taxRate / 100;
    const taxAmount = discountedSubtotal * taxRate;

    // Service Charge
    const serviceRate = this.currentTicket.orderType === 'dine-in' ? (this.appState.settings.serviceChargeRate / 100) : 0;
    const serviceAmount = discountedSubtotal * serviceRate;

    // Tip
    let tipAmount = 0;
    if (this.currentTicket.tipPercent > 0) {
      tipAmount = (discountedSubtotal * this.currentTicket.tipPercent) / 100;
    } else if (this.currentTicket.tipFixed > 0) {
      tipAmount = this.currentTicket.tipFixed;
    }

    const grandTotal = discountedSubtotal + taxAmount + serviceAmount + tipAmount;

    this.updateTotals(subtotal, discountAmount, taxAmount + serviceAmount, grandTotal);
  }

  updateTotals(subtotal, discount, tax, grandTotal) {
    const sym = this.appState.settings.currencySymbol || '₹';
    document.getElementById('calc-subtotal').innerText = `${sym}${subtotal.toFixed(2)}`;
    document.getElementById('calc-discount').innerText = discount > 0 ? `-${sym}${discount.toFixed(2)}` : `${sym}0.00`;
    document.getElementById('calc-tax').innerText = `${sym}${tax.toFixed(2)}`;
    document.getElementById('calc-total').innerText = `${sym}${grandTotal.toFixed(2)}`;
  }

  setOrderType(type) {
    this.currentTicket.orderType = type;
    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
    if (type === 'takeout') {
      this.currentTicket.tableNumber = 'Takeout Counter';
    } else if (type === 'delivery') {
      this.currentTicket.tableNumber = 'Delivery Order';
    }
    this.renderCart();
  }

  promptDiscountModal() {
    const val = prompt('Enter Discount Percentage (e.g. 10 for 10%):', '10');
    if (val !== null) {
      const pct = parseFloat(val);
      if (!isNaN(pct) && pct >= 0 && pct <= 100) {
        this.currentTicket.discountPercent = pct;
        this.appState.showToast(`Applied ${pct}% Discount!`, 'success');
        this.renderCart();
      }
    }
  }

  clearCart() {
    if (this.currentTicket.items.length === 0) return;
    if (confirm('Clear current order ticket?')) {
      this.currentTicket.items = [];
      this.currentTicket.discountPercent = 0;
      this.currentTicket.tipPercent = 0;
      this.renderCart();
    }
  }

  holdOrder() {
    if (this.currentTicket.items.length === 0) {
      this.appState.showToast('Ticket is empty', 'warning');
      return;
    }
    this.appState.heldOrders.push({ ...this.currentTicket });
    this.appState.showToast(`Order ${this.currentTicket.orderId} put on Hold`, 'info');
    window.soundEngine.play('click');
    this.resetCart();
  }

  sendToKitchen() {
    if (this.currentTicket.items.length === 0) {
      this.appState.showToast('Add items before sending to kitchen', 'warning');
      return;
    }

    const kdsTicket = {
      id: 'KDS-' + Math.floor(800 + Math.random() * 200),
      orderId: this.currentTicket.orderId,
      tableNumber: this.currentTicket.tableNumber,
      server: this.appState.currentUser.name,
      timeSent: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: 0,
      urgent: false,
      items: this.currentTicket.items.map(i => ({
        name: i.name,
        qty: i.qty,
        mods: i.modifiers
      })),
      status: 'pending'
    };

    this.appState.kitchenTickets.unshift(kdsTicket);
    window.soundEngine.play('kitchen');
    this.appState.showToast(`Order ${this.currentTicket.orderId} sent to Kitchen Display!`, 'success');

    const badge = document.getElementById('kds-count-badge');
    if (badge) {
      badge.innerText = this.appState.kitchenTickets.length;
    }

    if (this.appState.kdsModule) {
      this.appState.kdsModule.render();
    }
  }

  openPaymentModal() {
    if (this.currentTicket.items.length === 0) {
      this.appState.showToast('Ticket is empty', 'warning');
      return;
    }
    if (this.appState.paymentModule) {
      this.appState.paymentModule.open(this.currentTicket);
    }
  }

  resetCart() {
    this.currentTicket = {
      orderId: this.generateOrderId(),
      orderType: 'dine-in',
      tableId: null,
      tableNumber: 'Select Table',
      items: [],
      discountPercent: 0,
      discountFixed: 0,
      tipPercent: 0,
      tipFixed: 0,
      notes: ''
    };
    this.renderCart();
  }
}

window.RegisterModule = RegisterModule;
