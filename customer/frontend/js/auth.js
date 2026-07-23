/**
 * GLOWTIME — Auth (login / register)
 * ─────────────────────────────────────────────────────
 * ใช้ในหน้าที่มี loginModal / registerModal (index.html)
 * โหลดหลัง shared.js
 * ─────────────────────────────────────────────────────
 */

// ─── Login ───────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass  = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  const btn   = document.getElementById('loginSubmit');

  errEl.textContent = '';
  btn.disabled = true; btn.textContent = 'Signing in…';

  try {
    await _api.Auth.login(email, pass);
    closeModal('loginModal');
    document.getElementById('loginForm').reset();
    updateAuthUI();
    await syncGuestCart(); // ซิงค์ guest cart หลัง login
    refreshCartCount();
    toast('ยินดีต้อนรับกลับมา! 👋');
  } catch (err) {
    errEl.textContent = err.message || 'เข้าสู่ระบบไม่สำเร็จ';
  } finally {
    btn.disabled = false; btn.textContent = 'Sign In';
  }
  return false;
}

// ─── Register ────────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const email    = document.getElementById('regEmail').value;
  const pass     = document.getElementById('regPass').value;
  const skinType = document.getElementById('regSkin').value || undefined;
  const errEl    = document.getElementById('registerError');
  const btn      = document.getElementById('registerSubmit');

  errEl.textContent = '';
  btn.disabled = true; btn.textContent = 'Creating…';

  try {
    await _api.Auth.register(username, email, pass, skinType);
    closeModal('registerModal');
    document.getElementById('registerForm').reset();
    updateAuthUI();
    await syncGuestCart(); // ซิงค์ guest cart หลังสมัคร
    toast('สมัครสมาชิกสำเร็จ! 🎉');
  } catch (err) {
    errEl.textContent = err.message || 'สมัครสมาชิกไม่สำเร็จ';
  } finally {
    btn.disabled = false; btn.textContent = 'Create Account';
  }
  return false;
}

// ─── Sync guest cart after login/register ─────────────
async function syncGuestCart() {
  const items = GuestCart.get();
  if (!items.length) return;
  let synced = 0;
  for (const item of items) {
    try { await _api.Cart.add(item.id, item.qty); synced++; } catch {}
  }
  GuestCart.clear();
  if (synced > 0) {
    toast(`เพิ่ม ${synced} รายการจากตะกร้าชั่วคราวลง Cart แล้ว ✓`);
    refreshCartCount();
  }
}

// ─── Guest cart prompt ────────────────────────────────
function openGuestCartPrompt() {
  const items = GuestCart.get();
  if (!items.length) { toast('ตะกร้าว่างเปล่า'); return; }
  const names = items.map(i => `${i.name} ×${i.qty}`).join(', ');
  toast(`🛒 ${names} — Login เพื่อยืนยันการสั่งซื้อ`);
  openModal('loginModal');
}
