/* ==========================================================================
   AuraPOS Inventory & Stock Management Module (INR Currency)
   ========================================================================== */

class InventoryModule {
  constructor(appState) {
    this.appState = appState;
  }

  init() {
    this.render();
  }

  render() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;

    const items = this.appState.menuItems;
    const sym = this.appState.settings.currencySymbol || '₹';

    grid.innerHTML = items.map(item => {
      const isLow = item.stock <= item.lowStockThreshold;
      const isOut = item.stock <= 0;
      const statusText = isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK';
      const statusClass = isOut ? 'danger' : isLow ? 'warning' : 'success';

      return `
        <div class="inv-card">
          <div class="inv-info">
            <h4>${item.name}</h4>
            <p>Category: ${item.category.toUpperCase()} | Cost: ${sym}${item.cost.toFixed(2)} | Price: ${sym}${item.price.toFixed(2)}</p>
            <div style="margin-top:6px;">
              <span class="stock-tag ${statusClass}">${statusText}</span>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="stock-count-badge">${item.stock}</span>
            <button class="add-btn adjust-stock-btn" data-id="${item.id}" title="Adjust Stock Count">
              +
            </button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.adjust-stock-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const item = this.appState.menuItems.find(i => i.id === id);
        if (!item) return;

        const val = prompt(`Adjust Stock for "${item.name}" (Current: ${item.stock}):`, item.stock);
        if (val !== null) {
          const count = parseInt(val);
          if (!isNaN(count) && count >= 0) {
            item.stock = count;
            window.soundEngine.play('click');
            this.appState.showToast(`Updated stock count for ${item.name} to ${count}`, 'success');
            this.render();
            if (this.appState.registerModule) {
              this.appState.registerModule.renderDishes();
            }
          }
        }
      });
    });
  }
}

window.InventoryModule = InventoryModule;
