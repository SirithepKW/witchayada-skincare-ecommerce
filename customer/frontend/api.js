/**
 * GLOWTIME — Customer Frontend API Client
 * ─────────────────────────────────────────────────────
 * Wrapper รอบ fetch() เพื่อเชื่อมกับ Customer Backend
 * Base URL: https://witchayada-skincare-ecommerce.vercel.app
 * ─────────────────────────────────────────────────────
 */

// เลือกปลายทาง API อัตโนมัติ:
// - เปิดจากเครื่องตัวเอง (localhost) → เรียก backend ในเครื่องที่พอร์ต 5000
// - เปิดจากเว็บที่ deploy แล้ว → เรียก URL production
const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://witchayada-skincare-ecommerce.vercel.app';

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
/**
 * แปลงข้อมูลสินค้าจาก backend (MySQL) ให้อยู่ในรูปแบบที่หน้าเว็บใช้
 * — Backend เวอร์ชัน DB คืน imageUrl เป็น string เดี่ยว และ
 *   ingredients / skinTypeTarget เป็น string ("A, B, C")
 *   ส่วนหน้าเว็บคาดหวังเป็น array ทั้งหมด
 * — แปลงที่ฝั่ง frontend เพื่อไม่ต้องแก้โค้ด backend
 * — ถ้าข้อมูลเป็น array อยู่แล้ว (mock เดิม) จะส่งผ่านตามเดิม ใช้ได้ทั้งคู่
 */
function normalizeProduct(p) {
  if (!p) return p;
  const toArr = (v, lower = false) => {
    if (Array.isArray(v)) return v;
    if (!v) return [];
    return String(v).split(',').map(s => lower ? s.trim().toLowerCase() : s.trim()).filter(Boolean);
  };
  // ── เลือกรูปสินค้า ───────────────────────────────
  // 1) ถ้า DB ให้ path ในเครื่อง (images/...) มา → ใช้ตามนั้น
  // 2) ถ้าชื่อสินค้าตรงกับไฟล์รูปที่มี → ใช้ไฟล์นั้น
  // 3) ถ้าไม่ตรง → เลือกรูปตามหมวดหมู่ (fallback ชั่วคราวจนกว่า DB จะ seed ข้อมูลชุดใหม่)
  const KNOWN_IMAGES = ['hydrating-serum','renewal-cream','radiance-oil','gentle-cleanser',
                        'hydrating-mist','glow-mask','daily-spf-50','niacinamide-10','rose-barrier-cream'];
  const CATEGORY_IMAGE = {
    serum: 'hydrating-serum', toner: 'hydrating-mist', moisturizer: 'renewal-cream',
    cleanser: 'gentle-cleanser', sunscreen: 'daily-spf-50', oil: 'radiance-oil',
    mist: 'hydrating-mist', mask: 'glow-mask', cream: 'renewal-cream',
  };
  const slug = String(p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  let imgs = Array.isArray(p.images) && p.images.length ? p.images : (p.imageUrl ? [p.imageUrl] : []);
  const first = imgs[0] || '';
  if (!first.startsWith('images/')) {
    let pick = null;
    if (KNOWN_IMAGES.includes(slug)) pick = slug;                                 // ชื่อตรงไฟล์เป๊ะ
    else if (String(p.name || '').toLowerCase().includes('niacinamide')) pick = 'niacinamide-10';
    else pick = CATEGORY_IMAGE[String(p.category || '').toLowerCase()] || null;   // เลือกตามหมวด
    imgs = pick ? [`images/products/${pick}.jpg`] : imgs;
  }
  return {
    ...p,
    price: Number(p.price) || 0,
    stockQty: Number(p.stockQty) || 0,
    ingredients: toArr(p.ingredients),
    skinTypeTarget: toArr(p.skinTypeTarget, true),
    images: imgs,
    averageRating: Number(p.averageRating) || 0,
    reviewCount: Number(p.reviewCount) || 0,
  };
}

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
      return (res.data || []).map(normalizeProduct);
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
      return normalizeProduct(res.data);
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
/**
 * แปลงข้อมูลออเดอร์จาก backend (MySQL) ให้ตรงกับที่หน้าเว็บใช้
 * — รายการรวม (getMyOrders) ไม่ส่ง items มา → กัน o.items.map พัง
 * — สถานะจาก seed เก่าเป็นตัวใหญ่ ("Confirmed") → แปลงเป็นตัวเล็กให้ timeline จับได้
 */
function normalizeOrder(o) {
  if (!o) return o;
  let status = String(o.status || '').toLowerCase();
  if (status === 'pending') status = 'pending_payment';
  return {
    ...o,
    status,
    items: Array.isArray(o.items) ? o.items : [],
    totalAmount: Number(o.totalAmount) || 0,
  };
}

const Orders = {
  async create(shippingAddress, paymentMethod) {
    const res = await apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress, paymentMethod }),
    });
    return normalizeOrder(res.data);
  },

  async list() {
    const res = await apiFetch('/api/orders');
    const orders = (res.data || []).map(normalizeOrder);
    // backend ส่งรายการรวมมาโดยไม่มี items → ดึงรายละเอียดมาเติมทีละออเดอร์
    await Promise.all(orders.map(async (o) => {
      if (o.items.length) return;
      try {
        const full = await Orders.get(o.orderId);
        o.items = Array.isArray(full.items) ? full.items : [];
      } catch { /* เติมไม่ได้ก็แสดงการ์ดแบบไม่มีรายการสินค้า */ }
    }));
    return orders;
  },

  async get(orderId) {
    const res = await apiFetch(`/api/orders/${dbOrderId(orderId)}`);
    return normalizeOrder(res.data);
  },

  async confirmReceive(orderId) {
    const res = await apiFetch(`/api/orders/${dbOrderId(orderId)}/receive`, { method: 'PUT' });
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
/**
 * แปลงเลขออเดอร์ให้เป็นตัวเลขที่ backend (MySQL) ใช้ได้
 * — backend คืนเลขสวยงาม "ORD-20260724-0005" แต่ตอนรับกลับต้องการเลขจริง (5)
 * — กันบัค Number("ORD-...") = NaN ที่ทำให้ชำระเงินพัง (500)
 */
function dbOrderId(orderId) {
  if (typeof orderId === 'number') return orderId;
  const s = String(orderId || '');
  if (/^\d+$/.test(s)) return Number(s);
  const m = /-(\d+)$/.exec(s);          // "ORD-20260724-0005" → "0005" → 5
  return m ? Number(m[1]) : orderId;
}

const Payments = {
  async checkout(orderId, method) {
    const res = await apiFetch('/api/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ orderId: dbOrderId(orderId), method }),
    });
    return res.data;
  },
};

// Export เพื่อใช้ใน HTML (global scope)
window.GlowtimeAPI = { Auth, Products, Cart, Orders, Reviews, Payments, getUser, getToken };