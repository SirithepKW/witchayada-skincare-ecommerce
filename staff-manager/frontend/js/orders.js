/**
 * GLOWTIME — Staff & Admin Order Management Logic (js/orders.js)
 * ─────────────────────────────────────────────────────────────
 * ระบบจัดการคำสั่งซื้อ การอนุมัติสลิปโอนเงินเฉพาะสเตตัส "รอการชำระเงิน (pending_payment)"
 * และการอัปเดตสเตตัสการจัดส่งที่สอดคล้องกับลอจิสติกส์จริง
 * ─────────────────────────────────────────────────────────────
 */

let activeSelectedOrderId = null;

let ordersList = [
  { 
    id: 1, 
    orderId: "ORD-20260722-0001", 
    customerId: 1, 
    status: "pending_payment", 
    paymentMethod: "PromptPay QR Code",
    slipRef: "SLIP-20260722-9988 (K-Bank)",
    items: [
      { orderItemId: 1, productId: 1001, productName: "Hydrating Serum 30ml", qty: 2, unitPrice: 590.00, subtotal: 1180.00 },
      { orderItemId: 2, productId: 1007, productName: "Daily SPF 50+ Sunscreen", qty: 1, unitPrice: 490.00, subtotal: 490.00 }
    ], 
    totalAmount: 1670.00, 
    shippingAddress: { recipient: "คุณศิรินทร์ภา วงศ์อุบล", phone: "081-234-5678", address: "123/45 ถนนสุขุมวิท เขตคลองเตย", province: "กรุงเทพมหานคร", postalCode: "10110" }, 
    createdAt: "2026-07-22T20:45:00+07:00" 
  },
  { 
    id: 2, 
    orderId: "ORD-20260722-0002", 
    customerId: 2, 
    status: "confirmed", 
    paymentMethod: "Credit Card (VISA *** 4921)",
    slipRef: "TXN-20260722-4921",
    approvedAt: "22 ก.ค. 2026 18:30 น.",
    items: [
      { orderItemId: 1, productId: 1002, productName: "Renewal Cream 50g", qty: 1, unitPrice: 890.00, subtotal: 890.00 }
    ], 
    totalAmount: 890.00, 
    shippingAddress: { recipient: "คุณภัทรพงศ์ อนันต์", phone: "089-876-5432", address: "88/12 ถนนแจ้งวัฒนะ", province: "นนทบุรี", postalCode: "11000" }, 
    createdAt: "2026-07-22T18:12:00+07:00" 
  },
  { 
    id: 3, 
    orderId: "ORD-20260701-0001", 
    customerId: 3, 
    status: "delivered", 
    paymentMethod: "PromptPay QR Code",
    slipRef: "SLIP-20260701-1122",
    approvedAt: "01 ก.ค. 2026 10:30 น.",
    trackingNo: "KRY-98765432-TH (Kerry Express)",
    deliveredAt: "03 ก.ค. 2026 14:15 น.",
    signedBy: "คุณณัฐณิชา กิตติช่วง",
    items: [
      { orderItemId: 1, productId: 1001, productName: "Hydrating Serum 30ml", qty: 1, unitPrice: 590.00, subtotal: 590.00 }
    ], 
    totalAmount: 590.00, 
    shippingAddress: { recipient: "คุณณัฐณิชา กิตติช่วง", phone: "086-555-1234", address: "99/5 ถนนนิมมานเหมินท์ อ.เมือง", province: "เชียงใหม่", postalCode: "50200" }, 
    createdAt: "2026-07-01T10:15:00+07:00" 
  }
];

const statusBadgeMap = {
  'pending':         '<span class="status-badge badge-warning">Pending Payment</span>',
  'pending_payment': '<span class="status-badge badge-warning">Pending Payment</span>',
  'paid':            '<span class="status-badge badge-info">Confirmed (Paid)</span>',
  'confirmed':       '<span class="status-badge badge-info">Confirmed (Paid)</span>',
  'processing':      '<span class="status-badge badge-info">Processing</span>',
  'shipped':         '<span class="status-badge badge-info">Shipping</span>',
  'shipping':        '<span class="status-badge badge-info">Shipping</span>',
  'delivered':       '<span class="status-badge badge-success">Delivered</span>',
  'completed':       '<span class="status-badge badge-success">Delivered</span>',
  'cancelled':       '<span class="status-badge badge-danger">Cancelled</span>'
};

document.addEventListener('DOMContentLoaded', async () => {
  if (window.GlowtimeAdminAPI) {
    const apiOrders = await window.GlowtimeAdminAPI.Orders.list();
    if (apiOrders && apiOrders.length > 0) {
      ordersList = apiOrders;
    }
  }
  renderOrderTable(ordersList);
});

function renderOrderTable(items) {
  const tbody = document.getElementById('orderTableBody');
  if (!tbody) return;

  tbody.innerHTML = items.map(o => `
    <tr>
      <td>
        <strong>#${o.orderId}</strong>
        <div style="font-size:0.7rem; color:var(--gray);">${o.createdAt ? o.createdAt.split('T')[0] : ''}</div>
      </td>
      <td>
        <strong>${o.shippingAddress?.recipient || 'Customer'}</strong>
        <div style="font-size:0.7rem; color:var(--gray);">${o.shippingAddress?.province || ''} · ${o.shippingAddress?.address || ''}</div>
      </td>
      <td>
        <div style="font-size:0.8rem;">${Array.isArray(o.items) ? o.items.map(i => `${i.productName || 'Item'} x ${i.qty}`).join(', ') : '-'}</div>
      </td>
      <td><strong>฿${Number(o.totalAmount || 0).toLocaleString()}</strong></td>
      <td>${statusBadgeMap[o.status] || `<span class="status-badge">${o.status}</span>`}</td>
      <td>
        <button class="btn-dark-sm" onclick="openOrderDetail('${o.orderId}')">View Details</button>
      </td>
    </tr>
  `).join('');
}

function filterOrders(status) {
  if (status === 'all') renderOrderTable(ordersList);
  else renderOrderTable(ordersList.filter(o => o.status === status));
}

function openOrderDetail(ordId) {
  activeSelectedOrderId = ordId;
  const ord = ordersList.find(o => o.orderId === ordId);
  if (!ord) return;

  const titleEl = document.getElementById('modalOrdId');
  const infoEl = document.getElementById('modalCustomerInfo');
  const actionContainer = document.getElementById('modalPaymentActionBox');

  if (titleEl) titleEl.textContent = ord.orderId;

  // 1. Render Customer & Items Info
  if (infoEl) {
    infoEl.innerHTML = `
      <div style="background:var(--cream); padding:1rem; border:1px solid var(--border); border-radius:4px; margin-bottom:1rem;">
        <h4 style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--gray); margin-bottom:0.4rem;">Customer & Shipping Address</h4>
        <p style="font-size:0.95rem; margin-bottom:0.2rem;"><strong>${ord.shippingAddress?.recipient || 'Customer'}</strong></p>
        <p style="font-size:0.8rem; color:var(--gray); margin-bottom:0.4rem;">${ord.shippingAddress?.phone || '081-XXX-XXXX'}</p>
        <p style="font-size:0.82rem; color:var(--black); line-height:1.4;">${ord.shippingAddress?.address || ''} ${ord.shippingAddress?.province || ''} ${ord.shippingAddress?.postalCode || ''}</p>
      </div>

      <div style="padding:1rem; border:1px solid var(--border); border-radius:4px;">
        <h4 style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--gray); margin-bottom:0.4rem;">Order Items</h4>
        <ul style="list-style:none; padding:0; margin:0; font-size:0.82rem;">
          ${Array.isArray(ord.items) ? ord.items.map(i => `
            <li style="display:flex; justify-content:space-between; padding:0.35rem 0; border-bottom:1px dashed var(--border);">
              <span>${i.productName} <strong>x${i.qty}</strong></span>
              <strong>฿${Number(i.subtotal || (i.unitPrice * i.qty)).toLocaleString()}</strong>
            </li>
          `).join('') : ''}
        </ul>
        <div style="display:flex; justify-content:space-between; margin-top:0.8rem; font-size:0.95rem; font-weight:bold;">
          <span>Total Amount:</span>
          <span style="color:#8B6F5E;">฿${Number(ord.totalAmount || 0).toLocaleString()}</span>
        </div>
      </div>
    `;
  }

  // 2. Render Dynamic Payment & Fulfillment Actions
  if (actionContainer) {
    if (ord.status === 'pending_payment' || ord.status === 'pending') {
      // ONLY SHOW PAYMENT SLIP VERIFICATION & APPROVAL BUTTONS FOR PENDING PAYMENT!
      actionContainer.innerHTML = `
        <div style="background:var(--cream); padding:1rem; border:1px solid var(--border); border-radius:4px; height:100%;">
          <h4 style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--gray); margin-bottom:0.4rem;">Payment Slip Verification</h4>
          <div style="text-align:center; padding:1.2rem; background:#fff; border:1px dashed var(--border); border-radius:4px;">
            <div style="font-size:0.85rem; font-weight:bold; color:var(--black); margin-bottom:0.2rem;">${ord.paymentMethod || 'PromptPay QR Code'}</div>
            <div style="font-size:0.72rem; color:var(--gray); margin-bottom:0.6rem;">Ref ID: ${ord.slipRef || 'SLIP-20260722-9988'}</div>
            <div style="display:inline-block; padding:0.4rem 0.8rem; background:rgba(197, 160, 89, 0.15); color:#8B6F5E; font-weight:bold; font-size:0.85rem; border-radius:2px; margin-bottom:0.8rem;">
              Pending Payment: ฿${Number(ord.totalAmount).toLocaleString()}
            </div>
            <p style="font-size:0.72rem; color:var(--gray); margin-bottom:1rem;">Please verify the payment slip before approving.</p>
            <div style="display:flex; gap:0.5rem; justify-content:center;">
              <button class="btn-dark-sm" onclick="approveSlip('${ord.orderId}')">Approve Slip</button>
              <button class="btn-ghost-sm" style="color:var(--status-danger);" onclick="rejectSlip('${ord.orderId}')">Reject</button>
            </div>
          </div>
        </div>
      `;
    } else if (ord.status === 'confirmed' || ord.status === 'paid' || ord.status === 'processing') {
      // CONFIRMED / READY FOR PACKING
      actionContainer.innerHTML = `
        <div style="background:var(--cream); padding:1rem; border:1px solid var(--border); border-radius:4px; height:100%;">
          <h4 style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--gray); margin-bottom:0.4rem;">Payment Confirmed & Fulfillment</h4>
          <div style="padding:1rem; background:#fff; border:1px solid var(--border); border-radius:4px;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.6rem;">
              <span class="status-badge badge-success">Payment Approved</span>
            </div>
            <p style="font-size:0.8rem; color:var(--black); margin-bottom:0.4rem;">Method: <strong>${ord.paymentMethod || 'PromptPay QR'}</strong></p>
            <p style="font-size:0.75rem; color:var(--gray); margin-bottom:0.8rem;">Approved at: ${ord.approvedAt || '22 Jul 2026 18:30'}</p>
            <div style="background:rgba(74, 103, 65, 0.08); padding:0.8rem; border-radius:4px; margin-bottom:1rem; font-size:0.8rem; color:#4A6741;">
              <strong>Status:</strong> Payment confirmed — packing in progress.
            </div>
            <button class="btn-dark-sm" style="width:100%; justify-content:center;" onclick="promptShipOrder('${ord.orderId}')">Enter Tracking & Ship Order</button>
          </div>
        </div>
      `;
    } else if (ord.status === 'shipping' || ord.status === 'shipped') {
      // SHIPPING IN TRANSIT
      actionContainer.innerHTML = `
        <div style="background:var(--cream); padding:1rem; border:1px solid var(--border); border-radius:4px; height:100%;">
          <h4 style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--gray); margin-bottom:0.4rem;">Shipment Details</h4>
          <div style="padding:1rem; background:#fff; border:1px solid var(--border); border-radius:4px;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.6rem;">
              <span class="status-badge badge-info">Shipping</span>
            </div>
            <p style="font-size:0.82rem; margin-bottom:0.4rem;"><strong>Tracking No.:</strong> <span style="color:#8B6F5E; font-weight:bold;">${ord.trackingNo || 'KRY-98765432-TH (Kerry Express)'}</span></p>
            <p style="font-size:0.75rem; color:var(--gray); margin-bottom:1rem;">Parcel has been handed to carrier — estimated delivery within 24h.</p>
            <button class="btn-dark-sm" style="width:100%; justify-content:center;" onclick="markDelivered('${ord.orderId}')">Mark as Delivered</button>
          </div>
        </div>
      `;
    } else if (ord.status === 'delivered' || ord.status === 'completed') {
      // DELIVERED / COMPLETED
      actionContainer.innerHTML = `
        <div style="background:var(--cream); padding:1rem; border:1px solid var(--border); border-radius:4px; height:100%;">
          <h4 style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--gray); margin-bottom:0.4rem;">Delivery Summary</h4>
          <div style="padding:1rem; background:#fff; border:1px solid var(--border); border-radius:4px;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.6rem;">
              <span class="status-badge badge-success">Delivered</span>
            </div>
            <p style="font-size:0.8rem; margin-bottom:0.3rem;"><strong>Received by:</strong> ${ord.signedBy || ord.shippingAddress?.recipient || '-'}</p>
            <p style="font-size:0.8rem; margin-bottom:0.3rem;"><strong>Delivered at:</strong> ${ord.deliveredAt || '03 Jul 2026 14:15'}</p>
            <p style="font-size:0.75rem; color:var(--gray);">Tracking No.: ${ord.trackingNo || 'KRY-98765432-TH (Kerry Express)'}</p>
          </div>
        </div>
      `;
    }
  }

  openModal('modalOrderDetail');
}

// ── Action Handlers ────────────────────────────────────────────

function approveSlip(ordId) {
  const ord = ordersList.find(o => o.orderId === ordId);
  if (!ord) return;

  ord.status = 'confirmed';
  ord.approvedAt = new Date().toLocaleString('th-TH');
  renderOrderTable(ordersList);
  openOrderDetail(ordId); // Refresh modal view cleanly
  showToast(`Payment slip for order #${ordId} has been approved.`);
}

function rejectSlip(ordId) {
  showToast(`Order #${ordId}: Payment slip rejected. Customer has been notified.`);
}

function promptShipOrder(ordId) {
  const ord = ordersList.find(o => o.orderId === ordId);
  if (!ord) return;

  const tracking = prompt("กรุณาระบุเลขพัสดุ (Tracking Number):", `KRY-${Math.floor(10000000 + Math.random()*90000000)}-TH`);
  if (tracking) {
    ord.status = 'shipping';
    ord.trackingNo = tracking + ' (Kerry Express)';
    renderOrderTable(ordersList);
    openOrderDetail(ordId);
    showToast(`Order #${ordId} shipped. Tracking: ${tracking}`);
  }
}

function markDelivered(ordId) {
  const ord = ordersList.find(o => o.orderId === ordId);
  if (!ord) return;

  ord.status = 'delivered';
  ord.deliveredAt = new Date().toLocaleString('th-TH');
  ord.signedBy = ord.shippingAddress?.recipient || 'ลูกค้าผู้รับ';
  renderOrderTable(ordersList);
  openOrderDetail(ordId);
  showToast(`Order #${ordId} marked as Delivered.`);
}

function updateOrderStatus(newStatus) {
  const ord = ordersList.find(o => o.orderId === activeSelectedOrderId);
  if (ord) {
    ord.status = newStatus;
    renderOrderTable(ordersList);
    openOrderDetail(activeSelectedOrderId);
    showToast(`อัปเดตคำสั่งซื้อ ${ord.orderId} เป็นสถานะ "${newStatus}" แล้ว`);
  }
}
