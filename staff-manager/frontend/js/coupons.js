/**
 * GLOWTIME — Staff & Admin Coupons Management (js/coupons.js)
 * ─────────────────────────────────────────────────────────────
 */

let couponsList = [
  {
    id: 1,
    code: 'GLOW20',
    description: '20% discount on Serum products (Min spend ฿1,000)',
    type: 'percentage',
    value: 20,
    minSpend: 1000,
    usageCount: 145,
    usageLimit: 500,
    expiry: '2026-08-31',
    status: 'Active'
  },
  {
    id: 2,
    code: 'FREESHIP',
    description: 'Free shipping on all orders with no minimum',
    type: 'free_shipping',
    value: 0,
    minSpend: 0,
    usageCount: 200,
    usageLimit: 0, // 0 = Unlimited
    expiry: '2026-12-31',
    status: 'Active'
  }
];

const usageHistory = [
  { date: '23 Jul 2026, 13:42', code: 'GLOW20', orderId: '#ORD-0723-004', customer: 'Sompong K.', discount: '-฿240.00' },
  { date: '23 Jul 2026, 11:15', code: 'FREESHIP', orderId: '#ORD-0723-003', customer: 'Manee M.', discount: '-฿50.00' },
  { date: '22 Jul 2026, 18:20', code: 'GLOW20', orderId: '#ORD-0722-019', customer: 'Wichai T.', discount: '-฿450.00' },
  { date: '21 Jul 2026, 09:10', code: 'GLOW20', orderId: '#ORD-0721-001', customer: 'Nalinee S.', discount: '-฿310.00' }
];

document.addEventListener('DOMContentLoaded', () => {
  renderCouponTable();
  renderUsageHistory();
  updateStats();

  // Show/hide discount value field based on type selection
  const typeSelect = document.getElementById('couponType');
  if (typeSelect) {
    typeSelect.addEventListener('change', toggleDiscountValueField);
  }
});

function updateStats() {
  const activeCount = couponsList.filter(c => c.status === 'Active').length;
  const totalRedemptions = couponsList.reduce((sum, c) => sum + c.usageCount, 0);
  const el1 = document.getElementById('statActiveCoupons');
  const el2 = document.getElementById('statRedemptions');
  if (el1) el1.innerText = activeCount;
  if (el2) el2.innerText = totalRedemptions;
}

function formatDiscountType(coupon) {
  if (coupon.type === 'percentage') return `Percentage (${coupon.value}%)`;
  if (coupon.type === 'fixed') return `Fixed (฿${coupon.value})`;
  if (coupon.type === 'free_shipping') return 'Free Shipping';
  return coupon.type;
}

function formatUsageLimit(coupon) {
  const limit = coupon.usageLimit === 0 ? 'Unlimited' : coupon.usageLimit;
  return `${coupon.usageCount} / ${limit}`;
}

function formatExpiry(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderCouponTable() {
  const tbody = document.getElementById('couponTableBody');
  if (!tbody) return;

  tbody.innerHTML = couponsList.map(c => `
    <tr>
      <td><strong>${c.code}</strong></td>
      <td>${c.description}</td>
      <td>${formatDiscountType(c)}</td>
      <td>${formatUsageLimit(c)}</td>
      <td>${formatExpiry(c.expiry)}</td>
      <td><span class="status-badge badge-${c.status === 'Active' ? 'success' : 'danger'}">${c.status}</span></td>
      <td>
        <button class="btn-ghost-sm" onclick="editCoupon(${c.id})">Edit</button>
        <button class="btn-ghost-sm" style="color:var(--status-danger);" onclick="deleteCoupon(${c.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderUsageHistory() {
  const tbody = document.getElementById('usageHistoryBody');
  if (!tbody) return;

  tbody.innerHTML = usageHistory.map(h => `
    <tr>
      <td>${h.date}</td>
      <td><strong>${h.code}</strong></td>
      <td><a href="orders.html" style="color:var(--dark);">${h.orderId}</a></td>
      <td>${h.customer}</td>
      <td style="color:var(--status-danger);">${h.discount}</td>
    </tr>
  `).join('');
}

function toggleDiscountValueField() {
  const type = document.getElementById('couponType').value;
  const valueRow = document.getElementById('discountValueRow');
  if (valueRow) {
    valueRow.style.display = (type === 'free_shipping') ? 'none' : 'block';
  }
}

function resetCouponForm() {
  const form = document.getElementById('couponForm');
  if (form) form.reset();
  toggleDiscountValueField();
}

function openAddCouponModal() {
  resetCouponForm();
  document.getElementById('couponModalTitle').innerText = 'Add New Coupon';
  document.getElementById('editCouponId').value = '';
  // Set default expiry to 3 months from now
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  document.getElementById('couponExpiry').value = d.toISOString().split('T')[0];
  openModal('modalAddCoupon');
}

function editCoupon(id) {
  const coupon = couponsList.find(c => c.id === id);
  if (!coupon) return;

  resetCouponForm();

  document.getElementById('couponModalTitle').innerText = 'Edit Coupon — ' + coupon.code;
  document.getElementById('editCouponId').value = id;
  document.getElementById('couponCode').value = coupon.code;
  document.getElementById('couponDescription').value = coupon.description;
  document.getElementById('couponType').value = coupon.type;
  document.getElementById('couponValue').value = coupon.value;
  document.getElementById('couponMinSpend').value = coupon.minSpend;
  document.getElementById('couponUsageLimit').value = coupon.usageLimit;
  document.getElementById('couponExpiry').value = coupon.expiry;
  document.getElementById('couponStatus').value = coupon.status;

  toggleDiscountValueField();
  openModal('modalAddCoupon');
}

function saveCoupon(e) {
  e.preventDefault();

  const editId = document.getElementById('editCouponId').value;
  const isEdit = !!editId;

  const type = document.getElementById('couponType').value;
  const couponData = {
    id: isEdit ? Number(editId) : Math.max(0, ...couponsList.map(c => c.id)) + 1,
    code: document.getElementById('couponCode').value.trim().toUpperCase(),
    description: document.getElementById('couponDescription').value.trim(),
    type,
    value: type === 'free_shipping' ? 0 : Number(document.getElementById('couponValue').value),
    minSpend: Number(document.getElementById('couponMinSpend').value),
    usageLimit: Number(document.getElementById('couponUsageLimit').value),
    expiry: document.getElementById('couponExpiry').value,
    status: document.getElementById('couponStatus').value,
    usageCount: isEdit ? (couponsList.find(c => c.id === Number(editId))?.usageCount || 0) : 0,
  };

  if (isEdit) {
    const idx = couponsList.findIndex(c => c.id === Number(editId));
    if (idx !== -1) couponsList[idx] = couponData;
  } else {
    couponsList.unshift(couponData);
  }

  renderCouponTable();
  updateStats();
  closeModal('modalAddCoupon');
  resetCouponForm();
  showToast(`Coupon "${couponData.code}" ${isEdit ? 'updated' : 'created'} successfully!`);
}

function deleteCoupon(id) {
  const coupon = couponsList.find(c => c.id === id);
  if (!coupon) return;
  if (confirm(`Delete coupon "${coupon.code}"? This action cannot be undone.`)) {
    couponsList = couponsList.filter(c => c.id !== id);
    renderCouponTable();
    updateStats();
    showToast(`Coupon "${coupon.code}" has been deleted`);
  }
}
