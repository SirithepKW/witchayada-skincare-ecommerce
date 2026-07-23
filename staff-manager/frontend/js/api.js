/**
 * GLOWTIME — Staff & Admin Frontend API Client (js/api.js)
 * ─────────────────────────────────────────────────────────────
 * Wrapper รอบ fetch() เพื่อเชื่อมต่อระหว่าง Admin Frontend และ Admin/Staff Backend
 * Base URL: http://localhost:5000 (หรือเซิร์ฟเวอร์ที่ Deploy)
 * ─────────────────────────────────────────────────────────────
 */

const ADMIN_API_BASE = 'http://localhost:5000';

// ── Token & Auth Helpers ─────────────────────────────────────
const getAdminToken = () => localStorage.getItem('glowtime_token') || sessionStorage.getItem('glowtime_admin_token');
const setAdminToken = (token) => {
  localStorage.setItem('glowtime_token', token);
  sessionStorage.setItem('glowtime_admin_token', token);
};
const clearAdminToken = () => {
  localStorage.removeItem('glowtime_token');
  sessionStorage.removeItem('glowtime_admin_token');
  sessionStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminLoggedIn');
};
const getAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem('glowtime_user')) || { username: 'Visada Admin', role: 'manager' };
  } catch {
    return { username: 'Visada Admin', role: 'manager' };
  }
};

// ── Core Fetch Wrapper ───────────────────────────────────────
async function adminApiFetch(path, options = {}) {
  const token = getAdminToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${ADMIN_API_BASE}${path}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err) {
    console.warn(`[AdminAPI] Request to ${path} failed or using fallback mode:`, err.message);
    throw err;
  }
}

// ── Auth Module ──────────────────────────────────────────────
const AdminAuth = {
  async login(email, password) {
    try {
      const res = await adminApiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.data?.token) {
        setAdminToken(res.data.token);
        if (res.data.user) localStorage.setItem('glowtime_user', JSON.stringify(res.data.user));
      }
      sessionStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminLoggedIn', 'true');
      return res.data;
    } catch (e) {
      // Fallback สำหรับกรณีพัฒนา local/offline mock
      sessionStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminLoggedIn', 'true');
      return { success: true, message: 'LoggedIn Demo Mode' };
    }
  },

  logout() {
    clearAdminToken();
    sessionStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoggedIn');
  },

  isLoggedIn: () => localStorage.getItem('adminLoggedIn') === 'true' || sessionStorage.getItem('adminLoggedIn') === 'true' || !!getAdminToken(),
  currentUser: getAdminUser,
};

// ── Admin Products Module ─────────────────────────────────────
const AdminProducts = {
  async list(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await adminApiFetch(`/api/products${params ? '?' + params : ''}`);
      return res.data;
    } catch {
      return null; // fallback ให้หน้า UI ใช้ mock data เดิมถ้าไม่ได้เปิด backend
    }
  },

  async create(productData) {
    const res = await adminApiFetch('/api/manager/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return res.data;
  },

  async update(id, productData) {
    const res = await adminApiFetch(`/api/manager/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    return res.data;
  },

  async delete(id) {
    const res = await adminApiFetch(`/api/manager/products/${id}`, { method: 'DELETE' });
    return res.data;
  },

  async updateStock(productId, stockQty) {
    const res = await adminApiFetch(`/api/staff/stock/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ stock: stockQty }),
    });
    return res.data;
  }
};

// ── Admin Orders Module ───────────────────────────────────────
const AdminOrders = {
  async list() {
    try {
      const res = await adminApiFetch('/api/staff/orders');
      return res.data;
    } catch {
      return null;
    }
  },

  async updateStatus(orderId, status) {
    const res = await adminApiFetch(`/api/staff/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  async addShipment(orderId, trackingNumber, courier) {
    const res = await adminApiFetch('/api/staff/shipments', {
      method: 'POST',
      body: JSON.stringify({ orderId, trackingNumber, courier }),
    });
    return res.data;
  }
};

// Export to Global Scope
window.GlowtimeAdminAPI = {
  Auth: AdminAuth,
  Products: AdminProducts,
  Orders: AdminOrders,
  getAdminToken,
  getAdminUser
};
