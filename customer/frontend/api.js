/**
 * GLOWTIME — Customer Frontend API Client
 * ─────────────────────────────────────────────────────
 * Wrapper รอบ fetch() เพื่อเชื่อมกับ Customer Backend
 * Base URL: https://witchayada-skincare-ecommerce.vercel.app
 * ─────────────────────────────────────────────────────
 */

const API_BASE = 'https://witchayada-skincare-ecommerce.vercel.app';

// ── Token helpers ──────────────────────────────────────
const getToken = () => localStorage.getItem('glowtime_token');
const setToken = (token) => localStorage.setItem('glowtime_token', token);
const clearToken = () => localStorage.removeItem('glowtime_token');
const getUser = () => { try { return JSON.parse(localStorage.getItem('glowtime_user')); } catch { return null; } };
const setUser = (user) => localStorage.setItem('glowtime_user', JSON.stringify(user));
const clearUser = () => localStorage.removeItem('glowtime_user');

// ── Core fetch wrapper ─────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || 'เกิดข้อผิดพลาด');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ── Auth ───────────────────────────────────────────────
const Auth = {
  async login(email, password) {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  },

  async register(username, email, password, skinType, phone) {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, skinType, phone }),
    });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  },

  logout() {
    clearToken();
    clearUser();
  },

  isLoggedIn: () => !!getToken(),
  currentUser: getUser,
};

// ── Products ───────────────────────────────────────────
const Products = {
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.skinType) params.set('skinType', filters.skinType);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.search) params.set('search', filters.search);
    const qs = params.toString();
    const res = await apiFetch(`/api/products${qs ? '?' + qs : ''}`);
    return res.data;
  },

  async get(id) {
    const res = await apiFetch(`/api/products/${id}`);
    return res.data;
  },
};

// ── Cart ───────────────────────────────────────────────
const Cart = {
  async get() {
    const res = await apiFetch('/api/cart');
    return res.data;
  },

  async add(productId, qty = 1) {
    const res = await apiFetch('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, qty }),
    });
    return res.data;
  },

  async update(cartItemId, qty) {
    const res = await apiFetch(`/api/cart/items/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ qty }),
    });
    return res.data;
  },

  async remove(cartItemId) {
    const res = await apiFetch(`/api/cart/items/${cartItemId}`, { method: 'DELETE' });
    return res.data;
  },
};

// ── Orders ─────────────────────────────────────────────
const Orders = {
  async create(shippingAddress, paymentMethod) {
    const res = await apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress, paymentMethod }),
    });
    return res.data;
  },

  async list() {
    const res = await apiFetch('/api/orders');
    return res.data;
  },

  async get(orderId) {
    const res = await apiFetch(`/api/orders/${orderId}`);
    return res.data;
  },

  async confirmReceive(orderId) {
    const res = await apiFetch(`/api/orders/${orderId}/receive`, { method: 'PUT' });
    return res.data;
  },
};

// ── Reviews ────────────────────────────────────────────
const Reviews = {
  async list(productId) {
    const res = await apiFetch(`/api/reviews/${productId}`);
    return res.data;
  },

  async create(productId, rating, comment, orderId = null) {
    const res = await apiFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ productId, rating, comment, orderId }),
    });
    return res.data;
  },
};

// ── Payments ───────────────────────────────────────────
const Payments = {
  async checkout(orderId, method) {
    const res = await apiFetch('/api/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ orderId, method }),
    });
    return res.data;
  },
};

// Export เพื่อใช้ใน HTML (global scope)
window.GlowtimeAPI = { Auth, Products, Cart, Orders, Reviews, Payments, getUser, getToken };
