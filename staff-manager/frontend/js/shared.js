/**
 * GLOWTIME — Staff & Admin Shared UI Utilities (js/shared.js)
 * ─────────────────────────────────────────────────────────────
 * ฟังก์ชันหลักที่ใช้ร่วมกันในทุกหน้า Admin (Auth, Toasts, Dropdowns, Drawers, Modals)
 * ─────────────────────────────────────────────────────────────
 */

function checkAdminLoggedIn() {
  return localStorage.getItem('adminLoggedIn') === 'true' || 
         sessionStorage.getItem('adminLoggedIn') === 'true' || 
         !!localStorage.getItem('glowtime_token') ||
         (window.GlowtimeAdminAPI && window.GlowtimeAdminAPI.Auth.isLoggedIn());
}

function updateAuthOverlayState() {
  const overlay = document.getElementById('authOverlay');
  const isLoggedIn = checkAdminLoggedIn();
  if (isLoggedIn) {
    document.documentElement.classList.add('admin-logged-in');
    if (overlay) overlay.classList.add('hidden');
  } else {
    document.documentElement.classList.remove('admin-logged-in');
    if (overlay) overlay.classList.remove('hidden');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateAuthOverlayState);
} else {
  updateAuthOverlayState();
}

const ADMIN_ACCOUNTS = {
  'admin': { avatar: 'VK', name: 'Visada K.', email: 'admin@skincareshop.com', role: 'super_admin', roleTitle: 'Super Admin', badgeClass: 'badge-success', allowedPages: ['*'] },
  'visada@skincareshop.com': { avatar: 'VK', name: 'Visada K.', email: 'visada@skincareshop.com', role: 'super_admin', roleTitle: 'Super Admin', badgeClass: 'badge-success', allowedPages: ['*'] },
  
  'staff_pack': { avatar: 'PM', name: 'Pattarapon M.', email: 'pattarapon@skincareshop.com', role: 'pack_staff', roleTitle: 'Pack & Shipping Staff', badgeClass: 'badge-info', allowedPages: ['orders.html', 'inventory.html', 'products.html', 'categories.html'] },
  'pattarapon@skincareshop.com': { avatar: 'PM', name: 'Pattarapon M.', email: 'pattarapon@skincareshop.com', role: 'pack_staff', roleTitle: 'Pack & Shipping Staff', badgeClass: 'badge-info', allowedPages: ['orders.html', 'inventory.html', 'products.html', 'categories.html'] },
  
  'marketing': { avatar: 'JJ', name: 'Jirada J.', email: 'jirada@skincareshop.com', role: 'marketing', roleTitle: 'Marketing Specialist', badgeClass: 'badge-warning', allowedPages: ['marketing.html', 'content.html', 'products.html', 'categories.html'] },
  'jirada@skincareshop.com': { avatar: 'JJ', name: 'Jirada J.', email: 'jirada@skincareshop.com', role: 'marketing', roleTitle: 'Marketing Specialist', badgeClass: 'badge-warning', allowedPages: ['marketing.html', 'content.html', 'products.html', 'categories.html'] },
  
  'finance': { avatar: 'NS', name: 'Nattapong S.', email: 'accountant@skincareshop.com', role: 'accountant', roleTitle: 'Finance & Accountant', badgeClass: 'badge-success', allowedPages: ['index.html', 'orders.html'] },
  'accountant@skincareshop.com': { avatar: 'NS', name: 'Nattapong S.', email: 'accountant@skincareshop.com', role: 'accountant', roleTitle: 'Finance & Accountant', badgeClass: 'badge-success', allowedPages: ['index.html', 'orders.html'] }
};

function getCurrentAdminUser() {
  try {
    const saved = localStorage.getItem('glowtime_current_admin');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return ADMIN_ACCOUNTS['admin'];
}

// ── Auth Handling ───────────────────────────────────────────
async function handleAdminLogin(e) {
  if (e) e.preventDefault();
  const userEl = document.getElementById('adminUser');
  const passEl = document.getElementById('adminPass');

  const username = userEl ? userEl.value.trim().toLowerCase() : 'admin';
  const password = passEl ? passEl.value.trim() : '';

  const matchedAccount = ADMIN_ACCOUNTS[username] || {
    avatar: username.substring(0,2).toUpperCase(),
    name: username.charAt(0).toUpperCase() + username.slice(1),
    email: `${username}@skincareshop.com`,
    role: 'super_admin',
    roleTitle: 'Administrator',
    badgeClass: 'badge-success',
    allowedPages: ['*']
  };

  localStorage.setItem('glowtime_current_admin', JSON.stringify(matchedAccount));
  localStorage.setItem('adminLoggedIn', 'true');
  sessionStorage.setItem('adminLoggedIn', 'true');
  document.documentElement.classList.add('admin-logged-in');

  if (window.GlowtimeAdminAPI) {
    try {
      await window.GlowtimeAdminAPI.Auth.login(username, password);
    } catch (err) {
      console.warn('[Shared] Login API fallback:', err);
    }
  }

  // Refresh topbar & sidebar
  if (typeof renderAdminTopbar === 'function') renderAdminTopbar();
  if (typeof renderAdminSidebar === 'function') renderAdminSidebar();

  updateAuthOverlayState();
  showToast(`Successfully signed in as ${matchedAccount.name} (${matchedAccount.roleTitle})`);
}

function lockAdminSession() {
  localStorage.removeItem('adminLoggedIn');
  sessionStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('glowtime_current_admin');
  document.documentElement.classList.remove('admin-logged-in');
  if (window.GlowtimeAdminAPI) {
    window.GlowtimeAdminAPI.Auth.logout();
  }
  updateAuthOverlayState();
  showToast('Admin session locked successfully.');
}

// ── UI Dropdowns & Drawers ───────────────────────────────────
function toggleUserDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.classList.toggle('open');
}

window.addEventListener('click', (e) => {
  if (!e.target.closest('.user-profile-wrapper')) {
    const menu = document.getElementById('userDropdown');
    if (menu) menu.classList.remove('open');
  }
});

function toggleNotifDrawer() {
  const drawer = document.getElementById('notifDrawer');
  if (drawer) drawer.classList.toggle('open');
}

function clearNotifs() {
  const list = document.querySelector('.notif-list');
  const dot = document.querySelector('.notif-dot');
  if (list) {
    list.innerHTML = '<div style="padding:1rem; text-align:center; color:var(--gray); font-size:0.75rem;">No unread alerts</div>';
  }
  if (dot) dot.style.display = 'none';
  showToast('All notifications marked as read.');
}

// ── Modal Utilities ─────────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  }
});

// ── Toast Alert System ──────────────────────────────────────
function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span> <div>${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Global Search Utility ───────────────────────────────────
function globalSearch(query) {
  if (query && query.length > 2) {
    showToast(`กำลังค้นหา "${query}"...`);
  }
}
