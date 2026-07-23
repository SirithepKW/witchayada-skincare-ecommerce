/**
 * GLOWTIME — My Orders Page Logic
 * ─────────────────────────────────────────────────────
 * ติดตามสถานะ, ยืนยันรับสินค้า, เขียนรีวิว
 * โหลดหลัง shared.js (หน้านี้ต้อง login ก่อน)
 * ─────────────────────────────────────────────────────
 */

// ─── Status timeline ─────────────────────────────────
const STATUS_STEPS = [
  { key: 'pending_payment', label: 'รอชำระเงิน' },
  { key: 'confirmed',       label: 'ยืนยันแล้ว' },
  { key: 'shipping',        label: 'กำลังจัดส่ง' },
  { key: 'delivered',       label: 'ได้รับสินค้า' },
];

function renderStatusTrack(status) {
  const idx = STATUS_STEPS.findIndex(s => s.key === status);
  return `<div class="status-track">` + STATUS_STEPS.map((s, i) => {
    let cls = '';
    if (i < idx) cls = 'done';
    else if (i === idx) cls = (status === 'delivered') ? 'done' : 'current';
    return `<div class="status-step ${cls}"><div class="status-line"></div><div class="status-dot"></div><div class="status-label">${s.label}</div></div>`;
  }).join('') + `</div>`;
}

// ─── Load & render orders ────────────────────────────
async function loadOrders() {
  const listEl = document.getElementById('ordersList');
  listEl.innerHTML = '<p class="cart-empty">กำลังโหลด…</p>';

  try {
    const orders = await _api.Orders.list();
    if (!orders.length) {
      listEl.innerHTML = '<p class="cart-empty">ยังไม่มีคำสั่งซื้อ — <a href="index.html#shop">ไปช้อปกันเลย! 🛍️</a></p>';
      return;
    }
    listEl.innerHTML = orders.map(renderOrderCard).join('');
  } catch (err) {
    listEl.innerHTML = `<p class="cart-empty" style="color:#8B3A3A;">${err.message}</p>`;
  }
}

function renderOrderCard(o) {
  const date = new Date(o.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  const itemsMini = o.items.map(it => `${it.productName} ×${it.qty}`).join('<br/>');
  const canReceive = o.status === 'confirmed' || o.status === 'shipping';

  // ปุ่มรีวิวรายสินค้า — แสดงเมื่อสถานะ delivered
  const reviewBtns = o.status === 'delivered'
    ? o.items.map(it =>
        `<button class="btn-review-item" onclick="openReviewModal(${it.productId}, '${o.orderId}', '${it.productName.replace(/'/g, "\\'")}')">✎ รีวิว ${it.productName.length > 22 ? it.productName.slice(0, 22) + '…' : it.productName}</button>`
      ).join('')
    : '';

  return `
  <div class="order-card" id="order-${o.orderId}">
    <div class="order-card-head">
      <span class="order-id">${o.orderId}</span>
      <span class="order-date">${date}</span>
    </div>
    ${renderStatusTrack(o.status)}
    <div class="order-items-mini">${itemsMini}</div>
    <div class="order-total-row">
      <span>รวมทั้งสิ้น</span>
      <strong>฿${o.totalAmount.toLocaleString()}</strong>
    </div>
    <div class="order-actions">
      ${o.status === 'delivered' ? '<span class="badge-delivered">✓ ได้รับสินค้าแล้ว</span>' : ''}
      ${canReceive ? `<button class="btn-receive" onclick="handleConfirmReceive('${o.orderId}', this)">📦 ยืนยันรับสินค้า</button>` : ''}
      ${o.status === 'pending_payment' ? '<span class="note-pending">⏳ รอชำระเงิน — ไปที่หน้า Checkout</span>' : ''}
      ${reviewBtns}
    </div>
  </div>`;
}

// ─── Confirm receive (ยืนยันรับสินค้า) ────────────────
async function handleConfirmReceive(orderId, btn) {
  if (!confirm('ยืนยันว่าคุณได้รับสินค้าเรียบร้อยแล้ว?')) return;
  btn.disabled = true; btn.textContent = 'กำลังยืนยัน…';
  try {
    await _api.Orders.confirmReceive(orderId);
    toast('ยืนยันรับสินค้าเรียบร้อย ✓ อย่าลืมรีวิวสินค้านะคะ');
    loadOrders(); // โหลดรายการใหม่ → ปุ่มรีวิวจะโผล่มา
  } catch (err) {
    toast(err.message || 'ยืนยันไม่สำเร็จ', true);
    btn.disabled = false; btn.textContent = '📦 ยืนยันรับสินค้า';
  }
}

// ─── Write Review ────────────────────────────────────
// logic ทั้งหมดย้ายไปอยู่ js/review.js (ใช้ร่วมกับหน้าแรก)
// หน้านี้ไม่ต้อง refresh อะไรหลังรีวิวสำเร็จ

// ─── Init ─────────────────────────────────────────────
(function init() {
  // หน้านี้ต้อง login ก่อน — ถ้ายังไม่ login ให้กลับหน้าแรก
  if (!_api.Auth.isLoggedIn()) {
    location.href = 'index.html';
    return;
  }
  updateAuthUI();
  loadOrders();
})();
