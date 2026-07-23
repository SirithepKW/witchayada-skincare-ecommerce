/**
 * GLOWTIME — Staff & Admin User Management Logic (js/users.js)
 * ─────────────────────────────────────────────────────────────
 */

let usersList = [
  { id: 1, username: "napassorn_skin", email: "napassorn@glowtime.com", role: "customer", profile: { skinType: "sensitive (แพ้ง่าย)", phone: "081-234-5678" }, createdAt: "2026-07-01T10:00:00+07:00" },
  { id: 2, username: "karn_staff", email: "karn@glowtime.com", role: "staff", profile: { skinType: "combination", phone: "089-999-8888" }, createdAt: "2026-06-15T09:00:00+07:00" },
  { id: 3, username: "warakorn_mgr", email: "warakorn@glowtime.com", role: "manager", profile: { skinType: "normal", phone: "086-777-6666" }, createdAt: "2026-05-01T08:00:00+07:00" }
];

document.addEventListener('DOMContentLoaded', () => {
  renderUserTable(usersList);
});

function renderUserTable(items) {
  const tbody = document.getElementById('userTableBody');
  if (!tbody) return;

  tbody.innerHTML = items.map(u => `
    <tr>
      <td><strong>#${u.id}</strong></td>
      <td>
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <div style="width:32px; height:32px; background:#0A0A0A; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:0.8rem;">
            ${u.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>${u.username}</strong>
            <div style="font-size:0.7rem; color:var(--gray);">${u.email}</div>
          </div>
        </div>
      </td>
      <td><span class="status-badge badge-warning">${u.profile?.skinType || '-'}</span></td>
      <td><span style="font-size:0.8rem;">${u.profile?.phone || '-'}</span></td>
      <td>
        ${u.role === 'customer' 
          ? '<span class="status-badge badge-info">customer</span>' 
          : u.role === 'staff' 
            ? '<span class="status-badge badge-success">staff</span>' 
            : '<span class="status-badge badge-danger">manager</span>'}
      </td>
      <td><span style="font-size:0.75rem; color:var(--gray);">${u.createdAt ? u.createdAt.split('T')[0] : ''}</span></td>
      <td>
        <button class="btn-ghost-sm" onclick="showToast('ปรับปรุงสิทธิ์บัญชี ${u.username}')">Edit Role</button>
      </td>
    </tr>
  `).join('');
}
