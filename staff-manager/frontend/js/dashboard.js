/**
 * GLOWTIME — Interactive Dashboard & Analytics Logic (js/dashboard.js)
 * ─────────────────────────────────────────────────────────────
 * ระบบวิเคราะห์ยอดขาย กราฟโต้ตอบ (Chart.js) และตารางคลิกดูข้อมูลแบบป๊อปอัป
 * ─────────────────────────────────────────────────────────────
 */

let _revenueChart = null;
let _categoryChart = null;
let _skinChart = null;

// ── Chart Data Sets ──────────────────────────────────────────
const CHART_DATA = {
  '7D': {
    labels: ['Mon 17', 'Tue 18', 'Wed 19', 'Thu 20', 'Fri 21', 'Sat 22', 'Sun 23'],
    revenue: [42000, 58000, 49000, 68000, 85000, 92000, 105000],
    orders: [14, 19, 16, 22, 28, 31, 35],
    totalStat: '฿519,000',
    statChange: '▲ +24.8% vs last week'
  },
  '30D': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    revenue: [280000, 315000, 420000, 485000],
    orders: [95, 108, 142, 164],
    totalStat: '฿1,500,000',
    statChange: '▲ +18.5% vs last month'
  },
  '1Y': {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    revenue: [850000, 920000, 1100000, 1250000, 1380000, 1450000, 1500000, 0, 0, 0, 0, 0],
    orders: [280, 310, 370, 410, 460, 490, 509, 0, 0, 0, 0, 0],
    totalStat: '฿8,450,000',
    statChange: '▲ +32.1% YTD Growth'
  }
};

// ── Initialize Charts ─────────────────────────────────────────
function initDashboardCharts() {
  if (typeof Chart === 'undefined') return;

  // 1. Sales & Revenue Trend Chart (Bar/Line)
  const ctxRev = document.getElementById('revenueChart');
  if (ctxRev) {
    _revenueChart = new Chart(ctxRev.getContext('2d'), {
      type: 'bar',
      data: {
        labels: CHART_DATA['7D'].labels,
        datasets: [
          {
            label: 'Revenue (฿)',
            data: CHART_DATA['7D'].revenue,
            backgroundColor: 'rgba(10, 10, 10, 0.88)',
            hoverBackgroundColor: '#C5A059',
            borderRadius: 4,
            barThickness: 28,
            yAxisID: 'y'
          },
          {
            label: 'Total Orders',
            data: CHART_DATA['7D'].orders,
            type: 'line',
            borderColor: '#8B6F5E',
            borderWidth: 3,
            pointBackgroundColor: '#C5A059',
            pointRadius: 5,
            pointHoverRadius: 8,
            tension: 0.35,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top', labels: { font: { family: 'Inter', size: 12 } } },
          tooltip: {
            backgroundColor: '#0A0A0A',
            titleFont: { family: 'Inter', size: 13, weight: 'bold' },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 12,
            callbacks: {
              label: function(context) {
                if (context.dataset.yAxisID === 'y') {
                  return ` Revenue: ฿${context.raw.toLocaleString()}`;
                }
                return ` Orders: ${context.raw} orders`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Inter' } } },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              font: { family: 'Inter' },
              callback: value => '฿' + (value >= 1000 ? (value/1000) + 'k' : value)
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { font: { family: 'Inter' } }
          }
        }
      }
    });
  }

  // 2. Product Category Distribution (Doughnut Chart)
  const ctxCat = document.getElementById('categoryChart');
  if (ctxCat) {
    _categoryChart = new Chart(ctxCat.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Serums', 'Moisturizers', 'Sunscreen', 'Cleansers', 'Oils & Mists'],
        datasets: [{
          data: [45, 28, 15, 8, 4],
          backgroundColor: [
            '#0A0A0A',
            '#8B6F5E',
            '#C5A059',
            '#4A6741',
            '#D4C4B7'
          ],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { font: { family: 'Inter', size: 11 } } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw}% Revenue Share`
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  // 3. Customer Skin Type Target Chart (Bar Chart)
  const ctxSkin = document.getElementById('skinTypeChart');
  if (ctxSkin) {
    _skinChart = new Chart(ctxSkin.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Sensitive Skin', 'Dry Skin', 'Oily Skin', 'Combination Skin', 'Normal Skin'],
        datasets: [{
          label: 'Customer Profiles',
          data: [385, 270, 195, 160, 92],
          backgroundColor: 'rgba(197, 160, 89, 0.85)',
          hoverBackgroundColor: '#0A0A0A',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` Members: ${ctx.raw} profiles`
            }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.05)' } },
          y: { grid: { display: false } }
        }
      }
    });
  }
}

// ── Timeframe Filter Handler ──────────────────────────────────
function switchTimeframe(period, btn) {
  if (!CHART_DATA[period]) return;
  document.querySelectorAll('.time-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const data = CHART_DATA[period];
  
  // Update Revenue Stat Card
  const revStatEl = document.getElementById('statTotalRevenue');
  const revMetaEl = document.getElementById('statTotalRevenueMeta');
  if (revStatEl) revStatEl.textContent = data.totalStat;
  if (revMetaEl) revMetaEl.textContent = data.statChange;

  // Update Chart Data
  if (_revenueChart) {
    _revenueChart.data.labels = data.labels;
    _revenueChart.data.datasets[0].data = data.revenue;
    _revenueChart.data.datasets[1].data = data.orders;
    _revenueChart.update();
  }
  showToast(`Updated analytics view to ${period}`);
}

// ── Product Row Click Inspection Modal ────────────────────────
const PRODUCT_DETAILS = {
  1001: {
    name: "Hydrating Serum 30ml",
    category: "Serum",
    price: "฿590",
    salesQty: "480 units",
    totalRevenue: "฿283,200",
    stock: "120 units (In Stock)",
    targetSkin: "Dry, Sensitive, Normal",
    rating: "★ 4.8 / 5.0 (52 Reviews)"
  },
  1002: {
    name: "Daily SPF 50+ Sunscreen",
    category: "Sunscreen",
    price: "฿490",
    salesQty: "310 units",
    totalRevenue: "฿151,900",
    stock: "180 units (In Stock)",
    targetSkin: "All Skin Types",
    rating: "★ 4.9 / 5.0 (41 Reviews)"
  },
  1003: {
    name: "Renewal Cream 50g",
    category: "Moisturizer",
    price: "฿890",
    salesQty: "220 units",
    totalRevenue: "฿195,800",
    stock: "80 units",
    targetSkin: "Dry, Normal",
    rating: "★ 4.7 / 5.0 (38 Reviews)"
  },
  1004: {
    name: "Gentle Cleanser 150ml",
    category: "Cleanser",
    price: "฿390",
    salesQty: "195 units",
    totalRevenue: "฿76,050",
    stock: "200 units",
    targetSkin: "Sensitive, All Types",
    rating: "★ 4.6 / 5.0 (29 Reviews)"
  }
};

function inspectProduct(id) {
  const p = PRODUCT_DETAILS[id] || PRODUCT_DETAILS[1001];
  const modal = document.getElementById('detailModalOverlay');
  const body = document.getElementById('detailModalBody');
  const title = document.getElementById('detailModalTitle');

  if (!modal || !body) return;

  title.textContent = `🧴 Product Analytics: ${p.name}`;
  body.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.2rem; font-size:0.85rem;">
      <div style="background:var(--cream); padding:1rem; border-radius:4px;">
        <span style="font-size:0.68rem; color:var(--gray); text-transform:uppercase;">Category</span>
        <h4 style="margin:0.2rem 0; font-size:1.05rem;">${p.category}</h4>
        <p style="color:#8B6F5E; font-weight:600; font-size:1.1rem; margin-top:0.4rem;">${p.price}</p>
      </div>
      <div style="background:var(--cream); padding:1rem; border-radius:4px;">
        <span style="font-size:0.68rem; color:var(--gray); text-transform:uppercase;">Total Revenue</span>
        <h4 style="margin:0.2rem 0; font-size:1.05rem; color:#4A6741;">${p.totalRevenue}</h4>
        <p style="font-size:0.8rem; color:var(--black); margin-top:0.4rem;">Units Sold: ${p.salesQty}</p>
      </div>
    </div>

    <div style="margin-top:1.2rem; line-height:1.8; font-size:0.85rem;">
      <p><strong>📦 Current Inventory:</strong> ${p.stock}</p>
      <p><strong>👥 Target Skin Profile:</strong> ${p.targetSkin}</p>
      <p><strong>⭐ Customer Rating:</strong> ${p.rating}</p>
    </div>

    <div style="margin-top:1.5rem; text-align:right;">
      <button class="btn-dark-sm" onclick="closeDetailModal()">Close Window</button>
    </div>
  `;
  modal.classList.add('open');
}

// ── Order Row Click Inspection Modal ──────────────────────────
const ORDER_DETAILS = {
  'ORD-1': {
    id: '#ORD-20260722-0001',
    customer: 'Sirinpha Wongs-ubon',
    email: 'sirinpha@example.com',
    phone: '081-234-5678',
    items: 'Hyaluronic Acid Serum x 2',
    total: '฿1,500',
    method: 'PromptPay QR Code',
    status: 'Pending Payment',
    time: '22 Jul 2026 14:32'
  },
  'ORD-2': {
    id: '#ORD-20260722-0002',
    customer: 'Pattarapong Anan',
    email: 'pattarapong@example.com',
    phone: '089-876-5432',
    items: 'Vitamin C Brightening Toner x 1',
    total: '฿450',
    method: 'Credit Card (VISA *** 4921)',
    status: 'Confirmed (Paid)',
    time: '22 Jul 2026 12:15'
  },
  'ORD-3': {
    id: '#ORD-20260701-0001',
    customer: 'Natnicha Kittichuang',
    email: 'natnicha@example.com',
    phone: '086-555-1234',
    items: 'Gentle Cleanser x 1',
    total: '฿590',
    method: 'PromptPay QR',
    status: 'Delivered',
    time: '01 Jul 2026 09:40'
  }
};

function inspectOrder(orderKey) {
  const ord = ORDER_DETAILS[orderKey] || ORDER_DETAILS['ORD-1'];
  const modal = document.getElementById('detailModalOverlay');
  const body = document.getElementById('detailModalBody');
  const title = document.getElementById('detailModalTitle');

  if (!modal || !body) return;

  title.textContent = `📦 Order Details: ${ord.id}`;
  body.innerHTML = `
    <div style="background:var(--cream); padding:1.2rem; border-radius:4px; margin-bottom:1.2rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h4 style="margin:0; font-size:1rem;">${ord.customer}</h4>
        <span class="status-badge badge-warning">${ord.status}</span>
      </div>
      <p style="font-size:0.78rem; color:var(--gray); margin-top:0.3rem;">📧 ${ord.email} | 📞 ${ord.phone}</p>
    </div>

    <div style="font-size:0.85rem; line-height:1.9;">
      <p><strong>🛒 Items Ordered:</strong> ${ord.items}</p>
      <p><strong>💳 Payment Method:</strong> ${ord.method}</p>
      <p><strong>💰 Total Amount:</strong> <strong style="font-size:1.1rem; color:#8B6F5E;">${ord.total}</strong></p>
      <p><strong>🕒 Timestamp:</strong> ${ord.time}</p>
    </div>

    <div style="margin-top:1.5rem; display:flex; justify-content:space-between; align-items:center;">
      <a href="orders.html" class="btn-ghost-sm">View Full Order Management →</a>
      <button class="btn-dark-sm" onclick="closeDetailModal()">Close</button>
    </div>
  `;
  modal.classList.add('open');
}

function closeDetailModal() {
  const modal = document.getElementById('detailModalOverlay');
  if (modal) modal.classList.remove('open');
}

// ── DOM Load Trigger ──────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboardCharts);
} else {
  initDashboardCharts();
}
