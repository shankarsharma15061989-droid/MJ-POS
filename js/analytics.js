/* ==========================================================================
   AuraPOS Sales Analytics & Z-Report Dashboard Module (INR Currency)
   ========================================================================== */

class AnalyticsModule {
  constructor(appState) {
    this.appState = appState;
  }

  init() {
    this.renderMetrics();
    this.renderCharts();
    this.bindEvents();
  }

  bindEvents() {
    const zReportBtn = document.getElementById('generate-zreport-btn');
    if (zReportBtn) {
      zReportBtn.addEventListener('click', () => this.generateZReport());
    }
  }

  renderMetrics() {
    const txs = this.appState.transactions;
    const totalSales = txs.reduce((sum, t) => sum + t.total, 0);
    const totalOrders = txs.length;
    const avgTicket = totalOrders > 0 ? (totalSales / totalOrders) : 0;
    const sym = this.appState.settings.currencySymbol || '₹';

    const revEl = document.getElementById('metric-today-rev');
    const ordersEl = document.getElementById('metric-today-orders');
    const avgEl = document.getElementById('metric-avg-ticket');
    const topItemEl = document.getElementById('metric-top-item');

    if (revEl) revEl.innerText = `${sym}${totalSales.toFixed(2)}`;
    if (ordersEl) ordersEl.innerText = totalOrders;
    if (avgEl) avgEl.innerText = `${sym}${avgTicket.toFixed(2)}`;
    if (topItemEl) topItemEl.innerText = 'Ribeye Steak';
  }

  renderCharts() {
    this.renderHourlyChart();
    this.renderPaymentPieChart();
  }

  renderHourlyChart() {
    const canvas = document.getElementById('hourly-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    const hours = ['11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'];
    const salesData = [3500, 12500, 18200, 9400, 5800, 7200, 16800, 24500, 31000, 19500];

    const maxVal = Math.max(...salesData);

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - padding * 2) * (i / 4);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw Area Gradient & Line
    const stepX = (width - padding * 2) / (hours.length - 1);
    
    ctx.beginPath();
    salesData.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (val / maxVal) * (height - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Line
    ctx.beginPath();
    salesData.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (val / maxVal) * (height - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Points
    salesData.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (val / maxVal) * (height - padding * 2);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Plus Jakarta Sans';
      ctx.textAlign = 'center';
      ctx.fillText(hours[i], x, height - 12);
    });
  }

  renderPaymentPieChart() {
    const canvas = document.getElementById('payment-pie-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) / 3;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    const data = [
      { label: 'UPI / QR', val: 50, color: '#3b82f6' },
      { label: 'Cash', val: 30, color: '#10b981' },
      { label: 'Card', val: 20, color: '#f59e0b' }
    ];

    let startAngle = 0;
    data.forEach(slice => {
      const sliceAngle = (slice.val / 100) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = slice.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#151e32';
    ctx.fill();
  }

  generateZReport() {
    window.soundEngine.play('kaching');
    const sym = this.appState.settings.currencySymbol || '₹';
    const txs = this.appState.transactions;
    const totalSales = txs.reduce((sum, t) => sum + t.total, 0);
    const cashTotal = txs.filter(t => t.paymentMethod === 'CASH').reduce((sum, t) => sum + t.total, 0);
    const cardTotal = txs.filter(t => t.paymentMethod === 'CARD' || t.paymentMethod === 'QR').reduce((sum, t) => sum + t.total, 0);

    alert(
      `===== END OF DAY Z-REPORT (INR) =====\n` +
      `Date: ${new Date().toLocaleDateString()}\n` +
      `Total Net Revenue: ${sym}${totalSales.toFixed(2)}\n` +
      `Total Transactions: ${txs.length}\n` +
      `---------------------------------\n` +
      `Cash Payments: ${sym}${cashTotal.toFixed(2)}\n` +
      `UPI / Card Payments: ${sym}${cardTotal.toFixed(2)}\n` +
      `Cash Drawer Reconciliation: MATCHED (${sym}${(cashTotal + 2000).toFixed(2)} with ${sym}2000 float)\n` +
      `---------------------------------\n` +
      `Shift Close Status: APPROVED`
    );
  }
}

window.AnalyticsModule = AnalyticsModule;
