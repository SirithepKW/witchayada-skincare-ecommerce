/**
 * GLOWTIME — Customer Frontend API Client
 * ─────────────────────────────────────────────────────
 * Wrapper รอบ fetch() เพื่อเชื่อมกับ Customer Backend
 * Base URL: http://localhost:5000
 * ─────────────────────────────────────────────────────
 */

const API_BASE = 'http://localhost:5000';

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

const MOCK_PRODUCTS = [
  { id: 1001, name: "Hydrating Serum", brand: "GLOWTIME", category: "Serum", skinTypeTarget: ["dry", "sensitive", "normal"], ingredients: ["Hyaluronic Acid", "Vitamin B5", "Ceramide"], description: "เซรั่มเติมน้ำเข้มข้น ด้วย Hyaluronic Acid 3 โมเลกุล ช่วยกักเก็บความชุ่มชื้นลึกถึงชั้นผิว เหมาะกับผิวแห้งและผิวแพ้ง่าย ซึมไวไม่เหนียวเหนอะหนะ", price: 590, stockQty: 120, expiryDate: "2028-06-30", images: ["images/products/hydrating-serum.jpg"], averageRating: 4.5, reviewCount: 2 },
  { id: 1002, name: "Renewal Cream", brand: "GLOWTIME", category: "Moisturizer", skinTypeTarget: ["dry", "normal"], ingredients: ["Peptide Complex", "Squalane", "Shea Butter"], description: "ครีมฟื้นบำรุงผิวยามค่ำคืน ด้วย Peptide Complex ช่วยให้ผิวดูเรียบเนียน กระชับ พร้อม Squalane เติมความชุ่มชื้นตลอดคืน", price: 890, stockQty: 80, expiryDate: "2028-03-31", images: ["images/products/renewal-cream.jpg"], averageRating: 4.8, reviewCount: 5 },
  { id: 1003, name: "Radiance Oil", brand: "GLOWTIME", category: "Oil", skinTypeTarget: ["dry", "normal"], ingredients: ["Rosehip Oil", "Jojoba Oil", "Vitamin E"], description: "เฟซออยล์บำรุงผิวให้เปล่งประกาย ด้วยน้ำมันโรสฮิปสกัดเย็นอุดมวิตามิน ช่วยให้ผิวนุ่ม ดูสุขภาพดี", price: 750, stockQty: 60, expiryDate: "2027-12-31", images: ["images/products/radiance-oil.jpg"], averageRating: 4.6, reviewCount: 3 },
  { id: 1004, name: "Gentle Cleanser", brand: "GLOWTIME", category: "Cleanser", skinTypeTarget: ["all", "sensitive", "dry", "oily", "combination", "normal"], ingredients: ["Amino Acid Surfactant", "Glycerin"], description: "เจลล้างหน้าสูตรอ่อนโยน pH สมดุล ทำความสะอาดหมดจดโดยไม่ทำให้ผิวแห้งตึง", price: 390, stockQty: 200, expiryDate: "2028-09-30", images: ["images/products/gentle-cleanser.jpg"], averageRating: 4.7, reviewCount: 8 },
  { id: 1005, name: "Hydrating Mist", brand: "GLOWTIME", category: "Mist", skinTypeTarget: ["all", "sensitive", "dry", "oily", "combination", "normal"], ingredients: ["Rose Water", "Hyaluronic Acid"], description: "สเปรย์น้ำแร่ผสมน้ำกุหลาบ ฉีดเติมความสดชื่นระหว่างวัน", price: 320, stockQty: 150, expiryDate: "2028-01-31", images: ["images/products/hydrating-mist.jpg"], averageRating: 4.4, reviewCount: 4 },
  { id: 1006, name: "Glow Mask", brand: "GLOWTIME", category: "Mask", skinTypeTarget: ["combination", "oily", "normal"], ingredients: ["Kaolin Clay", "Vitamin C"], description: "มาส์กโคลนผสมวิตามินซี ช่วยดูดซับความมันส่วนเกิน ผลัดเซลล์ผิวอย่างอ่อนโยน", price: 450, stockQty: 90, expiryDate: "2027-10-31", images: ["images/products/glow-mask.jpg"], averageRating: 4.9, reviewCount: 6 },
  { id: 1007, name: "Daily SPF 50+", brand: "GLOWTIME", category: "Sunscreen", skinTypeTarget: ["all", "sensitive", "dry", "oily", "combination", "normal"], ingredients: ["Zinc Oxide", "Niacinamide"], description: "กันแดดเนื้อบางเบา SPF50+ PA++++ ไม่ทิ้งคราบขาว", price: 490, stockQty: 180, expiryDate: "2028-05-31", images: ["images/products/daily-spf-50.jpg"], averageRating: 4.8, reviewCount: 12 },
  { id: 1008, name: "Niacinamide 10%", brand: "GLOWTIME", category: "Serum", skinTypeTarget: ["oily", "combination"], ingredients: ["Niacinamide 10%", "Zinc PCA"], description: "เซรั่มไนอาซินาไมด์เข้มข้น 10% ช่วยลดเลือนรูขุมขน ควบคุมความมัน", price: 550, stockQty: 110, expiryDate: "2028-04-30", images: ["images/products/niacinamide-10.jpg"], averageRating: 4.6, reviewCount: 7 },
  { id: 1009, name: "Rose Barrier Cream", brand: "GLOWTIME", category: "Moisturizer", skinTypeTarget: ["sensitive", "dry"], ingredients: ["Rose Extract", "Ceramide NP"], description: "ครีมเสริมเกราะป้องกันผิว กลิ่นกุหลาบอ่อนๆ ด้วย Ceramide", price: 690, stockQty: 70, expiryDate: "2028-02-29", images: ["images/products/rose-barrier-cream.jpg"], averageRating: 4.7, reviewCount: 9 }
];

// ── Products ───────────────────────────────────────────
const Products = {
  async list(filters = {}) {
    try {
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
    } catch (e) {
      console.warn('[CustomerAPI] Products API failed/offline, fallback to mock data');
      let result = MOCK_PRODUCTS;
      if (filters.skinType) {
        const st = filters.skinType.toLowerCase();
        result = result.filter(p => p.skinTypeTarget.includes(st) || p.skinTypeTarget.includes('all'));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      return result;
    }
  },

  async get(id) {
    try {
      const res = await apiFetch(`/api/products/${id}`);
      return res.data;
    } catch (e) {
      return MOCK_PRODUCTS.find(p => p.id === Number(id)) || MOCK_PRODUCTS[0];
    }
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
