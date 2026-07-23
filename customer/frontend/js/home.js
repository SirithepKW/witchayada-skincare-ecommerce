/**
 * GLOWTIME — Home Page Logic
 * ─────────────────────────────────────────────────────
 * สินค้า, ค้นหา, filter, ตะกร้า, product detail (PDP)
 * โหลดหลัง shared.js และ auth.js
 * ─────────────────────────────────────────────────────
 */

// ─── Products ────────────────────────────────────────
const EMOJI_MAP = { Serum: '🧴', Moisturizer: '🫧', Oil: '✨', Cleanser: '🧼', Mist: '💦', Mask: '🧖', Sunscreen: '☀️' };
let _currentFilter = '';
let _currentSearch = '';

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  const count = document.getElementById('productCount');
  count.textContent = `${products.length} Product${products.length !== 1 ? 's' : ''}`;

  if (!products.length) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--gray); padding:3rem 0;">ไม่พบสินค้าที่ตรงกับเงื่อนไข</div>`;
    return;
  }

  grid.innerHTML = products.map(p => {
    const emoji = EMOJI_MAP[p.category] || '🧴';
    const stars = '★'.repeat(Math.round(p.averageRating)) + '☆'.repeat(5 - Math.round(p.averageRating));
    return `
    <div class="product-card" onclick="openProductDetail(${p.id})" style="cursor:pointer;">
      <div class="product-img-wrap" style="background:var(--cream);">
        ${p.images && p.images[0]
          ? `<img src="${p.images[0]}" alt="${p.name}" class="product-img" loading="lazy" onerror="this.outerHTML='<span class=\\'product-emoji\\'>${emoji}</span>'"/>`
          : `<span class="product-emoji">${emoji}</span>`}
      </div>
      <p class="product-cat">${p.category}</p>
      <p class="product-name">${p.name}</p>
      <p class="product-meta">${stars} (${p.reviewCount})</p>
      <p class="product-price">฿${p.price.toLocaleString()}</p>
      <button class="product-add" data-id="${p.id}" onclick="event.stopPropagation(); addToCart(this, ${p.id}, '${p.name}')">
        Add to Cart
      </button>
    </div>`;
  }).join('');
}

async function loadProducts(filter = '') {
  _currentFilter = filter;
  try {
    const params = {};
    if (filter) params.skinType = filter;
    if (_currentSearch) params.search = _currentSearch;
    const products = await _api.Products.list(params);
    renderProducts(products);
  } catch (err) {
    document.getElementById('productsGrid').innerHTML =
      `<div style="grid-column:1/-1; text-align:center; color:#8B3A3A; padding:3rem 0;">
        ⚠️ ไม่สามารถโหลดสินค้าได้ — Backend ออฟไลน์?<br/>
        <small style="color:var(--gray);">กรุณารัน <code>npm run dev</code> ใน <code>customer/backend</code></small>
      </div>`;
    document.getElementById('productCount').textContent = '—';
  }
}

// Filter chips
document.getElementById('filterBar').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  loadProducts(chip.dataset.filter);
});

// ─── Search (ค้นหาสินค้า) ─────────────────────────────
let _searchDebounce;

async function doSearch(term) {
  _currentSearch = term.trim();
  document.getElementById('searchClearBtn').classList.toggle('visible', !!_currentSearch);
  loadProducts(_currentFilter);
}

document.getElementById('searchInput').addEventListener('input', e => {
  clearTimeout(_searchDebounce);
  _searchDebounce = setTimeout(() => doSearch(e.target.value), 350); // debounce 350ms
});

function clearSearch() {
  document.getElementById('searchInput').value = '';
  doSearch('');
}

// ─── Add to Cart (guest-aware) ────────────────────────
async function addToCart(btn, productId, productName) {
  const orig = btn.textContent.trim();
  btn.disabled = true; btn.textContent = 'Adding…';

  if (!_api.Auth.isLoggedIn()) {
    // บันทึกใน guest cart ก่อน
    const products = await _api.Products.list();
    const product  = products.find(p => p.id === productId);
    if (product) GuestCart.add(product);
    updateGuestCartBadge();
    updateAuthUI();
    btn.textContent = 'Added ✓';
    btn.style.background = '#8B6F5E'; btn.style.color = '#fff'; btn.style.borderColor = '#8B6F5E';
    toast(`เพิ่ม "${productName}" ไว้ชั่วคราว — Login เพื่อยืนยันการสั่งซื้อ`);
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = ''; btn.style.color = ''; btn.style.borderColor = '';
      btn.disabled = false;
    }, 1800);
    return;
  }

  try {
    await _api.Cart.add(productId, 1);
    btn.textContent = 'Added ✓';
    btn.style.background = 'var(--black)'; btn.style.color = '#fff'; btn.style.borderColor = 'var(--black)';
    refreshCartCount();
    toast(`เพิ่ม "${productName}" ลงตะกร้าแล้ว ✓`);
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = ''; btn.style.color = ''; btn.style.borderColor = '';
      btn.disabled = false;
    }, 1500);
  } catch (err) {
    toast(err.message || 'เพิ่มสินค้าไม่สำเร็จ', true);
    btn.textContent = orig; btn.disabled = false;
  }
}

// ─── Cart Modal ──────────────────────────────────────
async function openCart() {
  openModal('cartModal');
  const listEl    = document.getElementById('cartItemsList');
  const totalEl   = document.getElementById('cartTotal');
  const totalAmt  = document.getElementById('cartTotalAmt');
  const checkBtn  = document.getElementById('checkoutBtn');

  listEl.innerHTML = '<p class="cart-empty">กำลังโหลด…</p>';
  totalEl.style.display = 'none'; checkBtn.style.display = 'none';

  try {
    const cart = await _api.Cart.get();
    if (!cart.items || cart.items.length === 0) {
      listEl.innerHTML = '<p class="cart-empty">ตะกร้าของคุณว่างเปล่า</p>';
      return;
    }

    listEl.innerHTML = cart.items.map(item => `
      <div class="cart-row">
        <div>
          <div class="cart-row-name">${item.productName}</div>
          <div class="cart-row-meta">฿${item.unitPrice.toLocaleString()} × ${item.qty}</div>
        </div>
        <span class="cart-row-qty">${item.qty}</span>
        <span class="cart-row-price">฿${item.subtotal.toLocaleString()}</span>
      </div>`).join('');

    totalAmt.textContent = `฿${cart.totalAmount.toLocaleString()}`;
    totalEl.style.display = 'flex';
    checkBtn.style.display = 'block';
    checkBtn.dataset.total = cart.totalAmount;
  } catch (err) {
    listEl.innerHTML = `<p class="cart-empty" style="color:#8B3A3A;">${err.message}</p>`;
  }
}

// ─── Checkout Navigation ──────────────────────────────
function handleCheckout() {
  window.location.href = 'checkout.html';
}

// ─── Subscribe (no backend needed) ────────────────────
function handleSubscribe(e) {
  e.preventDefault();
  const btn = document.getElementById('subscribeBtn');
  document.getElementById('subscribeEmail').value = '';
  btn.textContent = 'Subscribed ✓';
  setTimeout(() => { btn.textContent = 'Subscribe'; }, 2500);
  return false;
}

// ─── Product Detail (PDP) ────────────────────────────
let _pdpProduct = null; // เก็บ product ที่เปิดอยู่

async function openProductDetail(productId) {
  openModal('pdpModal');
  // reset while loading
  document.getElementById('pdpName').textContent = 'กำลังโหลด…';
  document.getElementById('pdpDesc').textContent = '';
  document.getElementById('pdpSkinTags').innerHTML = '';
  document.getElementById('pdpIngredients').innerHTML = '';
  document.getElementById('pdpReviewsWrap').style.display = 'none';

  try {
    const p = await _api.Products.get(productId);
    _pdpProduct = p;
    const emoji = EMOJI_MAP[p.category] || '🧴';
    const rating = p.averageRating || 0;
    const stars  = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

    // Fill image panel
    // Fill image panel — ใช้รูปจริง ถ้าไม่มี/โหลดไม่ได้ค่อยแสดงอิโมจิ
    const pdpEmojiEl = document.getElementById('pdpEmoji');
    if (p.images && p.images[0]) {
      pdpEmojiEl.innerHTML = `<img src="${p.images[0]}" alt="${p.name}" class="pdp-img" onerror="this.parentElement.textContent='${emoji}'"/>`;
    } else {
      pdpEmojiEl.textContent = emoji;
    }
    document.getElementById('pdpBrand').textContent   = p.brand;

    // Fill info panel
    document.getElementById('pdpCategory').textContent  = p.category;
    document.getElementById('pdpName').textContent      = p.name;
    document.getElementById('pdpStars').textContent     = stars;
    document.getElementById('pdpRatingNum').textContent = rating.toFixed(1);
    document.getElementById('pdpRatingCount').textContent = `(${p.reviewCount} รีวิว)`;
    document.getElementById('pdpPrice').textContent     = p.price.toLocaleString();
    document.getElementById('pdpDesc').textContent      = p.description || 'ไม่มีคำอธิบาย';

    // Skin type tags
    const skinTags = document.getElementById('pdpSkinTags');
    const skinLabel = { dry:'ผิวแห้ง', oily:'ผิวมัน', sensitive:'ผิวแพ้ง่าย', combination:'ผิวผสม', normal:'ผิวปกติ', all:'ทุกประเภทผิว' };
    skinTags.innerHTML = (p.skinTypeTarget || []).map(s =>
      `<span class="pdp-tag ${s === 'all' ? 'all' : ''}">${skinLabel[s] || s}</span>`
    ).join('');

    // Ingredients
    const ingWrap = document.getElementById('pdpIngredients');
    ingWrap.innerHTML = (p.ingredients || []).map(i =>
      `<span class="pdp-ingredient">${i}</span>`
    ).join('');

    // Stock
    const stockEl = document.getElementById('pdpStock');
    if (p.stockQty > 50)      { stockEl.textContent = `เพียงพอ (${p.stockQty})`; stockEl.className = 'pdp-meta-val pdp-stock-ok'; }
    else if (p.stockQty > 0)  { stockEl.textContent = `ใกล้หมด (${p.stockQty})`; stockEl.className = 'pdp-meta-val pdp-stock-low'; }
    else                      { stockEl.textContent = 'สินค้าหมด'; stockEl.className = 'pdp-meta-val pdp-stock-out'; }

    // Expiry
    document.getElementById('pdpExpiry').textContent = p.expiryDate
      ? new Date(p.expiryDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
      : '—';

    // CTA state
    const addBtn   = document.getElementById('pdpAddBtn');
    const guestNote = document.getElementById('pdpGuestNote');
    addBtn.disabled = p.stockQty <= 0;
    addBtn.textContent = p.stockQty <= 0 ? 'สินค้าหมด' : 'Add to Cart';
    guestNote.style.display = _api.Auth.isLoggedIn() ? 'none' : 'block';

    // ปุ่มเขียนรีวิว — แสดงเฉพาะลูกค้าที่เคยซื้อสินค้านี้และได้รับแล้ว
    updatePdpReviewBtn(p);

    // Load reviews async
    loadPdpReviews(productId);
  } catch (err) {
    document.getElementById('pdpName').textContent = 'ไม่สามารถโหลดสินค้าได้';
  }
}

// ── ปุ่มเขียนรีวิวใน PDP (Verified Purchase) ─────────
// แสดงเฉพาะเมื่อ login แล้ว + เคยซื้อสินค้านี้ + ออเดอร์นั้น delivered แล้ว
async function updatePdpReviewBtn(product) {
  const btn = document.getElementById('pdpReviewBtn');
  btn.style.display = 'none';
  if (!_api.Auth.isLoggedIn()) return;
  try {
    const orders = await _api.Orders.list();
    const purchased = orders.some(o =>
      o.status === 'delivered' &&
      (o.items || []).some(it => it.productId === product.id)
    );
    if (purchased) btn.style.display = 'block';
  } catch {}
}

function pdpWriteReview() {
  if (!_pdpProduct) return;
  // ไม่ต้องส่ง orderId — backend จะผูกกับออเดอร์ที่ซื้อให้เอง
  openReviewModal(_pdpProduct.id, null, _pdpProduct.name);
}

// หลังรีวิวสำเร็จ → refresh รีวิวใน PDP + rating บนการ์ดสินค้า
window.onReviewSubmitted = function (productId) {
  loadPdpReviews(productId);
  loadProducts(_currentFilter);
};

async function loadPdpReviews(productId) {
  try {
    const reviews = await _api.Reviews.list(productId);
    if (!reviews || !reviews.length) return;
    const wrap = document.getElementById('pdpReviewsWrap');
    const list = document.getElementById('pdpReviews');
    list.innerHTML = reviews.slice(0, 3).map(r => {
      const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      const date  = new Date(r.createdAt).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' });
      return `
        <div class="pdp-review-item">
          <div class="pdp-review-header">
            <span class="pdp-review-stars">${stars}</span>
            <span class="pdp-review-date">${date}</span>
          </div>
          <p class="pdp-review-text">${r.comment}</p>
        </div>`;
    }).join('');
    wrap.style.display = 'block';
  } catch {}
}

async function pdpAddToCart() {
  if (!_pdpProduct) return;
  const btn = document.getElementById('pdpAddBtn');
  const orig = btn.textContent;
  btn.disabled = true; btn.textContent = 'Adding…';

  if (!_api.Auth.isLoggedIn()) {
    GuestCart.add(_pdpProduct);
    updateGuestCartBadge();
    updateAuthUI();
    btn.textContent = 'Added ✓';
    document.getElementById('pdpGuestNote').style.display = 'block';
    toast(`เพิ่ม "${_pdpProduct.name}" ไว้ชั่วคราว — Login เพื่อยืนยัน`);
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2000);
    return;
  }

  try {
    await _api.Cart.add(_pdpProduct.id, 1);
    btn.textContent = 'Added ✓';
    refreshCartCount();
    toast(`เพิ่ม "${_pdpProduct.name}" ลงตะกร้าแล้ว ✓`);
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1500);
  } catch (err) {
    toast(err.message || 'เพิ่มไม่สำเร็จ', true);
    btn.textContent = orig; btn.disabled = false;
  }
}

// ─── Init ─────────────────────────────────────────────
(async function init() {
  updateAuthUI();
  updateGuestCartBadge();
  await loadProducts();
  if (_api.Auth.isLoggedIn()) refreshCartCount();
})();
