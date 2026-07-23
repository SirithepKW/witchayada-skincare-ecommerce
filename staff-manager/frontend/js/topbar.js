/**
 * GLOWTIME — Dynamic Admin Topbar / Navbar Component (js/topbar.js)
 * ─────────────────────────────────────────────────────────────
 * แสดงผล Topbar / Navigation Header ที่เป็นมาตรฐานเดียวกันสำหรับทุกหน้า Admin
 * ประกอบด้วย: Title, Subtitle, Search Box (🔍), Notification Bell (🔔), และ User Dropdown Profile
 * ─────────────────────────────────────────────────────────────
 */

function renderAdminTopbar() {
  const topbarEl = document.querySelector('header.topbar');
  if (!topbarEl) return;

  // Preserve page title & description if present in existing DOM
  const existingTitleEl = topbarEl.querySelector('.page-title');
  const existingSubEl = topbarEl.querySelector('.page-sub, p');

  const pageTitle = topbarEl.dataset.title || (existingTitleEl ? existingTitleEl.textContent : 'Admin Suite');
  const pageSub = topbarEl.dataset.sub || (existingSubEl ? existingSubEl.textContent : 'GLOWTIME Management System');

  const currentUser = (typeof getCurrentAdminUser === 'function') ? getCurrentAdminUser() : {
    avatar: 'VK', name: 'Visada K.', email: 'admin@skincareshop.com', roleTitle: 'Super Admin', badgeClass: 'badge-success'
  };

  topbarEl.innerHTML = `
    <div>
      <h1 class="page-title">${pageTitle}</h1>
      <p class="page-sub">${pageSub}</p>
    </div>

    <div class="topbar-actions">
      <!-- GLOBAL SEARCH BOX -->
      <div class="search-box">
        <span style="color:var(--gray); font-size:0.75rem; font-weight:600; letter-spacing:0.05em;">&#x2315;</span>
        <input type="text" placeholder="Search products, orders, customers..." onkeyup="globalSearch(this.value)">
      </div>

      <!-- NOTIFICATIONS BELL & DRAWER -->
      <div style="position:relative;">
        <div class="notif-bell" onclick="toggleNotifDrawer()">
          <span style="font-size:1rem; line-height:1;">&#9825;</span><span class="notif-dot"></span>
        </div>

        <div class="notif-drawer" id="notifDrawer">
          <div class="notif-header">
            <h4>System Alerts (3)</h4>
            <span style="font-size:0.65rem; color:var(--gray); cursor:pointer;" onclick="clearNotifs()">Mark all read</span>
          </div>
          <div class="notif-list">
            <div class="notif-item">
              <strong>New Order #ORD-20260722-0001</strong>
              <p>Payment ฿1,500 via PromptPay QR</p>
              <div class="time">2 minutes ago</div>
            </div>
            <div class="notif-item">
              <strong>Low Inventory Alert</strong>
              <p>Radiance Oil 30ml — only 4 units remaining</p>
              <div class="time">15 minutes ago</div>
            </div>
            <div class="notif-item">
              <strong>Sales Target Exceeded</strong>
              <p>Weekly revenue grew by +24.8% vs goal</p>
              <div class="time">1 hour ago</div>
            </div>
          </div>
        </div>
      </div>

      <!-- USER PROFILE DROPDOWN MENU -->
      <div class="user-dropdown-wrapper" style="position:relative;">
        <button class="user-profile-btn" onclick="toggleUserDropdown(event)">
          <div class="user-avatar">${currentUser.avatar || 'VK'}</div>
          <div class="user-details">
            <span class="user-name">${currentUser.name || 'Visada K.'}</span>
            <span class="user-role">${currentUser.roleTitle || 'Super Admin'} ▼</span>
          </div>
        </button>
        
        <div class="user-dropdown-menu" id="userDropdown">
          <div class="dropdown-header">
            <strong>${currentUser.name || 'Visada K.'}</strong>
            <p>${currentUser.email || 'admin@skincareshop.com'}</p>
            <span class="status-badge ${currentUser.badgeClass || 'badge-success'}" style="margin-top:0.4rem;">${currentUser.roleTitle || 'Super Administrator'}</span>
          </div>
          <hr style="border:0; border-top:1px solid var(--border); margin:0.5rem 0;"/>
          <button onclick="window.location.href='settings.html'" class="dropdown-item">Settings</button>
          <button onclick="lockAdminSession()" class="dropdown-item logout">Logout</button>
        </div>
      </div>
    </div>
  `;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderAdminTopbar);
} else {
  renderAdminTopbar();
}
