/**
 * GLOWTIME — Dynamic Admin Sidebar Component (js/sidebar.js)
 * ─────────────────────────────────────────────────────────────
 * แสดงผล Sidebar สำหรับทุกหน้าในระบบ Admin พร้อมระบุหน้า Active อัตโนมัติ
 * ─────────────────────────────────────────────────────────────
 */

function renderAdminSidebar() {
  const sidebarEl = document.getElementById('sidebar');
  if (!sidebarEl) return;

  let currentPath = window.location.pathname.split('/').pop();
  if (!currentPath || currentPath === '') {
    currentPath = 'index.html';
  }

  const menuSections = [
    {
      title: "Core System",
      items: [
        { href: "index.html", label: "Dashboard & Analytics" },
        { href: "orders.html", label: "Orders & Payments", badge: "3" },
        { href: "customers.html", label: "Customers & Skin Profiles" }
      ]
    },
    {
      title: "Catalogue & Inventory",
      items: [
        { href: "products.html", label: "Products" },
        { href: "categories.html", label: "Categories" },
        { href: "inventory.html", label: "Inventory & Batches" }
      ]
    },
    {
      title: "Growth & Settings",
      items: [
        { href: "content.html", label: "Reviews & Content" },
        { href: "marketing.html", label: "Promotions & Bundles" },
        { href: "coupons.html", label: "Coupons & Discounts" },
        { href: "settings.html", label: "System Settings" }
      ]
    }
  ];

  sidebarEl.innerHTML = `
    <div>
      <div class="sidebar-header">
        <a href="index.html" class="sidebar-logo">GLOWTIME</a>
        <p class="sidebar-tag">Staff Admin Suite</p>
      </div>
      
      <ul class="sidebar-nav">
        ${menuSections.map((section, idx) => `
          <li class="nav-section-title" style="${idx > 0 ? 'margin-top:0.8rem;' : ''}">${section.title}</li>
          ${section.items.map(item => {
            const isActive = currentPath === item.href;
            return `
              <li>
                <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}">
                  ${item.label}
                  ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
                </a>
              </li>
            `;
          }).join('')}
        `).join('')}
      </ul>
    </div>
  `;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderAdminSidebar);
} else {
  renderAdminSidebar();
}
