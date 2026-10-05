/* ==========================================================================
   AuraPOS Payment & Checkout Processing Module (INR Currency)
   ========================================================================== */

class PaymentModule {
  constructor(appState) {
    this.appState = appState;
    this.currentTicket = null;
    this.selectedMethod = 'cash'; // 'cash' | 'card' | 'qr' | 'gift'
    this.splitCount = 1;
    this.cashTendered = 0;
  }

  open(ticket) {
    this.currentTicket = ticket;
    this.selectedMethod = 'cash';
    this.splitCount = 1;

    // Calculate Grand Total
    const subtotal = ticket.items.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
    const discount = (subtotal * (ticket.discountPercent || 0)) / 100;
    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * (this.appState.settings.taxRate / 100);
    const service = ticket.orderType === 'dine-in' ? discountedSubtotal * (this.appState.settings.serviceChargeRate / 100) : 0;
    const tip = (discountedSubtotal * (ticket.tipPercent || 0)) / 100;
    const total = discountedSubtotal + tax + service + tip;

    ticket.calcSubtotal = subtotal;
    ticket.calcDiscount = discount;
    ticket.calcTax = tax + service;
    ticket.calcTip = tip;
    ticket.calcGrandTotal = total;

    this.cashTendered = Math.ceil(total);

    this.renderModal();
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.add('active');
  }

  renderModal() {
    const ticket = this.currentTicket;
    if (!ticket) return;

    const sym = this.appState.settings.currencySymbol || '₹';
    const splitAmount = ticket.calcGrandTotal / this.splitCount;

    document.getElementById('pay-order-id').innerText = ticket.orderId;
    document.getElementById('pay-table-name').innerText = ticket.tableNumber;
    document.getElementById('pay-due-amount').innerText = `${sym}${ticket.calcGrandTotal.toFixed(2)}`;

    // Split Selector
    const splitContainer = document.getElementById('split-buttons-container');
    if (splitContainer) {
      splitContainer.innerHTML = [1, 2, 3, 4].map(n => `
        <button class="filter-chip ${this.splitCount === n ? 'active' : ''}" data-split="${n}">
          ${n === 1 ? 'Full Pay' : `${n} Way Split (${sym}${(ticket.calcGrandTotal / n).toFixed(2)})`}
        </button>
      `).join('');

      splitContainer.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.splitCount = parseInt(e.currentTarget.dataset.split);
          window.soundEngine.play('click');
          this.renderModal();
        });
      });
    }

    // Payment Methods
    document.querySelectorAll('.pay-method-card').forEach(card => {
      const method = card.dataset.method;
      card.classList.toggle('active', method === this.selectedMethod);
      card.onclick = () => {
        this.selectedMethod = method;
        window.soundEngine.play('click');
        this.renderModal();
      };
    });

    // Method Details Body
    const detailsContainer = document.getElementById('pay-method-details');
    if (!detailsContainer) return;

    if (this.selectedMethod === 'cash') {
      const change = Math.max(0, this.cashTendered - splitAmount);
      detailsContainer.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <label style="font-weight:700;font-size:0.9rem;">Amount Tendered (${sym}):</label>
            <input type="number" id="cash-tendered-input" value="${this.cashTendered.toFixed(2)}" 
              style="width:140px;padding:8px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md);font-family:var(--font-mono);font-size:1.1rem;font-weight:700;text-align:right;" />
          </div>
          <div class="cash-quick-buttons">
            <button class="cash-btn" data-val="${splitAmount.toFixed(2)}">Exact</button>
            <button class="cash-btn" data-val="500">₹500</button>
            <button class="cash-btn" data-val="1000">₹1000</button>
            <button class="cash-btn" data-val="2000">₹2000</button>
          </div>
          <div style="background:var(--bg-dark);padding:12px;border-radius:var(--radius-md);display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
            <span style="color:var(--text-muted);font-weight:600;">Change Returned:</span>
            <span style="font-family:var(--font-heading);font-size:1.4rem;font-weight:800;color:var(--success);">${sym}${change.toFixed(2)}</span>
          </div>
        </div>
      `;

      const cashInput = document.getElementById('cash-tendered-input');
      if (cashInput) {
        cashInput.addEventListener('input', (e) => {
          this.cashTendered = parseFloat(e.target.value) || 0;
          this.renderModal();
        });
      }

      detailsContainer.querySelectorAll('.cash-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.cashTendered = parseFloat(e.currentTarget.dataset.val);
          window.soundEngine.play('click');
          this.renderModal();
        });
      });

    } else if (this.selectedMethod === 'card') {
      detailsContainer.innerHTML = `
        <div style="text-align:center;padding:1.5rem;background:var(--bg-dark);border-radius:var(--radius-md);display:flex;flex-direction:column;align-items:center;gap:12px;">
          <svg style="width:48px;height:48px;color:var(--primary);animation:pulse-dot 1.5s infinite;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <div style="font-weight:700;font-size:1rem;">Tap, Insert, or Swipe Card / UPI Terminal</div>
          <div style="font-size:0.8rem;color:var(--text-muted);">Waiting for PIN pad confirmation...</div>
        </div>
      `;
    } else if (this.selectedMethod === 'qr') {
      detailsContainer.innerHTML = `
        <div style="text-align:center;padding:1rem;background:var(--bg-dark);border-radius:var(--radius-md);display:flex;flex-direction:column;align-items:center;gap:10px;">
          <div style="background:#fff;padding:10px;border-radius:12px;display:inline-block;">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM19 15h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z"/></svg>
          </div>
          <div style="font-weight:700;font-size:0.9rem;">Scan QR to Pay via GPay / PhonePe / Paytm / BHIM UPI</div>
        </div>
      `;
    }

    // Process Complete Button
    const completeBtn = document.getElementById('complete-payment-btn');
    if (completeBtn) {
      completeBtn.onclick = () => this.processPayment();
    }
  }

  processPayment() {
    const ticket = this.currentTicket;
    if (!ticket) return;

    const sym = this.appState.settings.currencySymbol || '₹';
    window.soundEngine.play('kaching');

    // Create Transaction Record
    const tx = {
      id: ticket.orderId,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tableNumber: ticket.tableNumber,
      server: this.appState.currentUser.name,
      items: [...ticket.items],
      subtotal: ticket.calcSubtotal,
      discount: ticket.calcDiscount,
      tax: ticket.calcTax,
      tip: ticket.calcTip,
      total: ticket.calcGrandTotal,
      paymentMethod: this.selectedMethod.toUpperCase(),
      cashTendered: this.cashTendered,
      changeReturned: Math.max(0, this.cashTendered - ticket.calcGrandTotal)
    };

    this.appState.transactions.unshift(tx);

    // Auto decrement inventory stock
    ticket.items.forEach(cartItem => {
      const stockItem = this.appState.menuItems.find(m => m.id === cartItem.id);
      if (stockItem) {
        stockItem.stock = Math.max(0, stockItem.stock - cartItem.qty);
      }
    });

    // Close Modal
    document.getElementById('payment-modal').classList.remove('active');

    this.appState.showToast(`Payment of ${sym}${ticket.calcGrandTotal.toFixed(2)} completed successfully!`, 'success');

    // Show Receipt Print Preview
    this.printReceipt(tx);

    // Clear Cart Register & Table status
    if (ticket.tableId) {
      const tbl = this.appState.tables.find(t => t.id === ticket.tableId);
      if (tbl) {
        tbl.status = 'available';
        tbl.currentOrder = null;
        tbl.timeElapsed = null;
      }
    }

    this.appState.registerModule.resetCart();
  }

  printReceipt(tx) {
    const container = document.getElementById('thermal-receipt-container');
    if (!container) return;

    const sym = this.appState.settings.currencySymbol || '₹';

    container.innerHTML = `
      <div style="text-align:center;margin-bottom:12px;">
        <h2 style="font-size:16px;font-weight:bold;">${this.appState.settings.restaurantName}</h2>
        <p style="font-size:10px;">${this.appState.settings.address}</p>
        <p style="font-size:10px;">Tel: ${this.appState.settings.phone}</p>
        <p>--------------------------------</p>
      </div>
      <div style="font-size:11px;margin-bottom:8px;">
        <div>Receipt #: ${tx.id}</div>
        <div>Date: ${tx.date} ${tx.time}</div>
        <div>Table/Type: ${tx.tableNumber}</div>
        <div>Server: ${tx.server}</div>
      </div>
      <p>--------------------------------</p>
      <table style="width:100%;font-size:11px;border-collapse:collapse;margin-bottom:8px;">
        <thead>
          <tr style="border-bottom:1px dashed #000;">
            <th style="text-align:left;">QTY/ITEM</th>
            <th style="text-align:right;">PRICE</th>
          </tr>
        </thead>
        <tbody>
          ${tx.items.map(item => `
            <tr>
              <td>${item.qty}x ${item.name}</td>
              <td style="text-align:right;">${sym}${(item.unitPrice * item.qty).toFixed(2)}</td>
            </tr>
            ${item.modifiers.length > 0 ? `
              <tr>
                <td colspan="2" style="font-size:9px;padding-left:10px;color:#555;">+ ${item.modifiers.join(', ')}</td>
              </tr>
            ` : ''}
          `).join('')}
        </tbody>
      </table>
      <p>--------------------------------</p>
      <div style="font-size:11px;line-height:1.4;">
        <div style="display:flex;justify-content:space-between;"><span>Subtotal:</span><span>${sym}${tx.subtotal.toFixed(2)}</span></div>
        ${tx.discount > 0 ? `<div style="display:flex;justify-content:space-between;"><span>Discount:</span><span>-${sym}${tx.discount.toFixed(2)}</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;"><span>GST & Service Charge:</span><span>${sym}${tx.tax.toFixed(2)}</span></div>
        ${tx.tip > 0 ? `<div style="display:flex;justify-content:space-between;"><span>Tip:</span><span>${sym}${tx.tip.toFixed(2)}</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px;margin-top:4px;">
          <span>TOTAL PAID (${tx.paymentMethod}):</span><span>${sym}${tx.total.toFixed(2)}</span>
        </div>
        ${tx.paymentMethod === 'CASH' ? `
          <div style="display:flex;justify-content:space-between;font-size:10px;"><span>Cash Tendered:</span><span>${sym}${tx.cashTendered.toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:10px;"><span>Change Returned:</span><span>${sym}${tx.changeReturned.toFixed(2)}</span></div>
        ` : ''}
      </div>
      <p>--------------------------------</p>
      <div style="text-align:center;font-size:10px;margin-top:10px;">
        <p>${this.appState.settings.receiptFooterText}</p>
        <p style="margin-top:6px;font-weight:bold;">*** THANK YOU ***</p>
      </div>
    `;

    // Trigger browser print window
    window.print();
  }
}

window.PaymentModule = PaymentModule;
