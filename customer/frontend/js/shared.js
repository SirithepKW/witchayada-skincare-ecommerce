/**
 * GLOWTIME — Shared Utilities (ใช้ร่วมกันทุกหน้า)
 * ─────────────────────────────────────────────────────
 * toast, modal helpers, auth UI, guest cart, cart badge
 * โหลดหลัง api.js เสมอ
 * ─────────────────────────────────────────────────────
 */

const _api = window.GlowtimeAPI;

// ─── Toast ───────────────────────────────────────────
let _toastTimer;
function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'show' + (isError ? ' error' : '');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.className = ''; }, 3000);
}

// ─── Modal helpers ───────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = ''; }
function switchModal(from, to) { closeModal(from); openModal(to); }
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
});

// ─── Guest Cart (localStorage) ────────────────────────
const GuestCart = {
  _key: 'glowtime_guest_cart',
  get() { try { return JSON.parse(localStorage.getItem(this._key)) || []; } catch { return []; } },
  save(items) { localStorage.setItem(this._key, JSON.stringify(items)); },
  add(product) {
    const items = this.get();
    const existing = items.find(i => i.id === product.id);
    if (existing) { existing.qty += 1; }
    else { items.push({ id: product.id, name: product.name, price: product.price, qty: 1 }); }
    this.save(items);
  },
  count() { return this.get().reduce((s, i) => s + i.qty, 0); },
  clear() { localStorage.removeItem(this._key); },
};

// ─── Badges ──────────────────────────────────────────
function updateCartCount(n) {
  const el = document.getElementById('cartCount');
  if (!el) return;
  el.textContent = n;
  el.classList.toggle('visible', n > 0);
}

async function refreshCartCount() {
  if (!_api.Auth.isLoggedIn()) return;
  try {
    const cart = await _api.Cart.get();
    updateCartCount(cart.items?.length || 0);
  } catch {}
}

function updateGuestCartBadge() {
  const badge = document.getElementById('guestCartBadge');
  const wrap  = document.getElementById('navGuestCartWrap');
  if (!badge || !wrap) return;
  const n = GuestCart.count();
  badge.textContent = n;
  badge.classList.toggle('visible', n > 0);
  wrap.style.display = (!_api.Auth.isLoggedIn() && n > 0) ? 'block' : 'none';
}

// ─── Auth state UI ───────────────────────────────────
// องค์ประกอบบางตัวมีเฉพาะบางหน้า จึงเช็คก่อนแตะทุกครั้ง
function updateAuthUI() {
  const user = _api.getUser();
  const loggedIn = _api.Auth.isLoggedIn();
  const el = (id) => document.getElementById(id);

  if (el('navGuest'))   el('navGuest').style.display   = loggedIn ? 'none' : '';
  if (el('navUser'))    el('navUser').style.display    = loggedIn ? 'flex' : 'none';
  if (el('navCartBtn')) el('navCartBtn').style.display = loggedIn ? 'block' : 'none';
  if (el('navGuestCartWrap')) el('navGuestCartWrap').style.display = (!loggedIn && GuestCart.count() > 0) ? 'block' : 'none';
  if (user && el('navUsername')) el('navUsername').textContent = `Hi, ${user.username}`;
  updateGuestCartBadge();
}

// ─── Logout ──────────────────────────────────────────
function doLogout() {
  _api.Auth.logout();
  GuestCart.clear();
  // ถ้าอยู่หน้าที่ต้อง login (เช่น orders.html) ให้กลับหน้าแรก
  if (location.pathname.endsWith('orders.html')) {
    location.href = 'index.html';
    return;
  }
  updateAuthUI();
  toast('ออกจากระบบแล้ว');
  updateCartCount(0);
}
