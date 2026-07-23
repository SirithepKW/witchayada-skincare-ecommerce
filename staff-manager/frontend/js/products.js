function resolveProductImg(rawImg) {
  if (!rawImg || typeof rawImg !== 'string' || !rawImg.includes('.')) {
    return 'images/products/hydrating-serum.jpg';
  }
  const filename = rawImg.split('/').pop();
  return `images/products/${filename}`;
}

let productsList = [
  { id: 1001, name: "Hydrating Serum 30ml", brand: "GLOWTIME", category: "Serum", skinTypeTarget: ["dry", "sensitive", "normal"], ingredients: ["Hyaluronic Acid", "Vitamin B5", "Ceramide"], description: "เซรั่มเติมน้ำเข้มข้น ด้วย Hyaluronic Acid 3 โมเลกุล ช่วยกักเก็บความชุ่มชื้นลึกถึงชั้นผิว", price: 590.00, stockQty: 120, expiryDate: "2028-06-30", images: ["images/products/hydrating-serum.jpg"] },
  { id: 1002, name: "Renewal Cream 50g", brand: "GLOWTIME", category: "Moisturizer", skinTypeTarget: ["dry", "normal"], ingredients: ["Peptide Complex", "Squalane", "Shea Butter"], description: "ครีมฟื้นบำรุงผิวยามค่ำคืน ช่วยให้ผิวดูเรียบเนียน กระชับ", price: 890.00, stockQty: 80, expiryDate: "2028-03-31", images: ["images/products/renewal-cream.jpg"] },
  { id: 1003, name: "Radiance Oil 30ml", brand: "GLOWTIME", category: "Oil", skinTypeTarget: ["dry", "normal"], ingredients: ["Rosehip Oil", "Jojoba Oil", "Vitamin E"], description: "เฟซออยล์บำรุงผิวให้เปล่งประกาย ด้วยน้ำมันโรสฮิปสกัดเย็น", price: 750.00, stockQty: 60, expiryDate: "2027-12-31", images: ["images/products/radiance-oil.jpg"] },
  { id: 1004, name: "Gentle Cleanser 150ml", brand: "GLOWTIME", category: "Cleanser", skinTypeTarget: ["all"], ingredients: ["Amino Acid Surfactant", "Glycerin", "Chamomile Extract"], description: "เจลล้างหน้าสูตรอ่อนโยน pH สมดุล ทำความสะอาดหมดจดโดยไม่ทำให้ผิวแห้งตึง", price: 390.00, stockQty: 200, expiryDate: "2028-09-30", images: ["images/products/gentle-cleanser.jpg"] },
  { id: 1005, name: "Hydrating Mist 100ml", brand: "GLOWTIME", category: "Mist", skinTypeTarget: ["all"], ingredients: ["Rose Water", "Hyaluronic Acid", "Aloe Vera"], description: "สเปรย์น้ำแร่ผสมน้ำกุหลาบ ฉีดเติมความสดชื่นระหว่างวัน", price: 320.00, stockQty: 150, expiryDate: "2028-01-31", images: ["images/products/hydrating-mist.jpg"] },
  { id: 1006, name: "Glow Mask 100g", brand: "GLOWTIME", category: "Mask", skinTypeTarget: ["combination", "oily", "normal"], ingredients: ["Kaolin Clay", "Vitamin C", "Honey Extract"], description: "มาส์กโคลนผสมวิตามินซี ช่วยดูดซับความมันส่วนเกิน", price: 450.00, stockQty: 90, expiryDate: "2027-10-31", images: ["images/products/glow-mask.jpg"] },
  { id: 1007, name: "Daily SPF 50+ Sunscreen 50ml", brand: "GLOWTIME", category: "Sunscreen", skinTypeTarget: ["all"], ingredients: ["Zinc Oxide", "Niacinamide", "Centella Extract"], description: "กันแดดเนื้อบางเบา SPF50+ PA++++ ไม่ทิ้งคราบขาว ผสม Niacinamide", price: 490.00, stockQty: 5, expiryDate: "2028-05-31", images: ["images/products/daily-spf-50.jpg"] },
  { id: 1008, name: "Niacinamide 10% Serum 30ml", brand: "GLOWTIME", category: "Serum", skinTypeTarget: ["oily", "combination"], ingredients: ["Niacinamide 10%", "Zinc PCA"], description: "เซรั่มไนอาซินาไมด์เข้มข้น 10% ช่วยลดเลือนรูขุมขน ควบคุมความมัน", price: 550.00, stockQty: 110, expiryDate: "2028-04-30", images: ["images/products/niacinamide-10.jpg"] },
  { id: 1009, name: "Rose Barrier Cream 50g", brand: "GLOWTIME", category: "Moisturizer", skinTypeTarget: ["sensitive", "dry"], ingredients: ["Rose Extract", "Ceramide NP"], description: "ครีมเสริมเกราะป้องกันผิว กลิ่นกุหลาบอ่อนๆ ด้วย Ceramide", price: 690.00, stockQty: 70, expiryDate: "2028-02-29", images: ["images/products/rose-barrier-cream.jpg"] }
];

document.addEventListener('DOMContentLoaded', async () => {
  if (window.GlowtimeAdminAPI) {
    const apiProducts = await window.GlowtimeAdminAPI.Products.list();
    if (apiProducts && apiProducts.length > 0) {
      productsList = apiProducts;
    }
  }
  renderProductTable(productsList);
});

function openImageLightbox(imgSrc, title, category, price) {
  let modal = document.getElementById('imageLightboxModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'imageLightboxModal';
    modal.className = 'admin-modal-overlay';
    modal.onclick = function(e) { if (e.target === this) closeImageLightbox(); };
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="admin-modal-box" style="max-width: 480px; text-align: center; background: #ffffff; padding: 0; overflow: hidden; border-radius: 6px; box-shadow: 0 25px 60px rgba(0,0,0,0.35);">
      <div style="background: #0A0A0A; color: #ffffff; padding: 1rem 1.4rem; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase; color: #C5A059;">High-Res Product Image Preview</span>
        <button onclick="closeImageLightbox()" style="background: none; border: none; color: #ffffff; font-size: 1.5rem; cursor: pointer; line-height: 1;">&times;</button>
      </div>
      <div style="padding: 2rem 1.5rem; background: #FAF9F6; display: flex; justify-content: center; align-items: center; min-height: 300px;">
        <img src="${imgSrc}" alt="${title}" style="max-width: 100%; max-height: 360px; object-fit: contain; border-radius: 4px; box-shadow: 0 12px 30px rgba(0,0,0,0.12);" />
      </div>
      <div style="padding: 1.2rem 1.6rem; text-align: left; background: #ffffff; border-top: 1px solid var(--border);">
        <span class="status-badge badge-info" style="margin-bottom: 0.4rem; display: inline-block;">${category}</span>
        <h3 style="font-family: var(--serif); font-size: 1.35rem; margin: 0.2rem 0; color: var(--black);">${title}</h3>
        <p style="color: #8B6F5E; font-weight: 600; font-size: 1.2rem; margin: 0.3rem 0 0;">${price}</p>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function closeImageLightbox() {
  const modal = document.getElementById('imageLightboxModal');
  if (modal) modal.classList.remove('open');
}

function renderProductTable(items) {
  const tbody = document.getElementById('productTableBody');
  if (!tbody) return;

  tbody.innerHTML = items.map(p => {
    const rawImg = (p.images && p.images[0]) ? p.images[0] : '';
    const imgUrl = resolveProductImg(rawImg);
    const fallbackUrl = `/customer/frontend/images/products/${rawImg.split('/').pop() || 'hydrating-serum.jpg'}`;
    const safeTitle = (p.name || '').replace(/'/g, "\\'");

    return `
    <tr>
      <td><strong>#${p.id}</strong></td>
      <td>
        <div class="product-thumb" onclick="openImageLightbox('${imgUrl}', '${safeTitle}', '${p.category}', '฿${Number(p.price).toLocaleString()}')" title="Click to view image preview">
          <img src="${imgUrl}" alt="${p.name}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackUrl}';"/>
        </div>
      </td>
      <td>
        <strong>${p.name}</strong>
        <div style="font-size:0.7rem; color:var(--gray);">Brand: ${p.brand || 'GLOWTIME'} | Key Ingredients: ${Array.isArray(p.ingredients) ? p.ingredients.join(', ') : (p.ingredients || '-')}</div>
      </td>
      <td><span class="status-badge badge-info">${p.category}</span></td>
      <td><strong>฿${Number(p.price).toLocaleString()}</strong></td>
      <td>
        ${p.stockQty < 10 
          ? `<strong style="color:var(--status-danger);">${p.stockQty} units (Low)</strong>` 
          : `<span>${p.stockQty} units</span>`}
      </td>
      <td><span style="font-size:0.75rem; color:var(--gray);">${p.expiryDate || '-'}</span></td>
      <td>
        <button class="btn-ghost-sm" onclick="editProduct(${p.id})">Edit</button>
        <button class="btn-ghost-sm" style="color:var(--status-danger);" onclick="deleteProductRow(${p.id})">Delete</button>
      </td>
    </tr>`;
  }).join('');
}

function filterProducts(cat) {
  if (cat === 'all') renderProductTable(productsList);
  else if (cat === 'low_stock') renderProductTable(productsList.filter(p => p.stockQty < 10));
  else renderProductTable(productsList.filter(p => p.category === cat));
}

function saveNewProduct(e) {
  e.preventDefault();

  const fileInput = document.getElementById('newProdImageFile');
  const file = fileInput && fileInput.files[0];

  // Use a local object URL if an image was uploaded, otherwise use a placeholder
  const localImageUrl = file ? URL.createObjectURL(file) : 'images/products/hydrating-serum.jpg';
  const fileName = file ? file.name : 'hydrating-serum.jpg';

  const ingredientsRaw = document.getElementById('newProdIngredients').value;
  const ingredients = ingredientsRaw
    ? ingredientsRaw.split(',').map(i => i.trim()).filter(Boolean)
    : [];

  const editId = document.getElementById('editProdId').value;
  const isEdit = !!editId;

  const prodData = {
    id: isEdit ? Number(editId) : Math.max(...productsList.map(p => p.id)) + 1,
    name: document.getElementById('newProdName').value.trim(),
    brand: document.getElementById('newProdBrand').value.trim() || 'GLOWTIME',
    category: document.getElementById('newProdCat').value,
    ingredients,
    description: document.getElementById('newProdDesc').value.trim(),
    price: Number(document.getElementById('newProdPrice').value),
    stockQty: Number(document.getElementById('newProdStock').value),
    expiryDate: document.getElementById('newProdExpiry').value,
  };

  if (file || !isEdit) {
    prodData.images = [localImageUrl];
    prodData._localImage = localImageUrl;
  }

  if (isEdit) {
    const idx = productsList.findIndex(p => p.id === Number(editId));
    if (idx !== -1) {
      if (!file) {
        // preserve old image if not uploading a new one
        prodData.images = productsList[idx].images;
        prodData._localImage = productsList[idx]._localImage;
      }
      productsList[idx] = { ...productsList[idx], ...prodData };
    }
  } else {
    productsList.unshift(prodData);
  }

  renderProductTable(productsList);
  closeModal('modalAddProduct');
  resetAddProductForm();
  showToast(`"${prodData.name}" ${isEdit ? 'updated' : 'added'} successfully!`);
}

function previewProductImage(input) {
  const file = input.files[0];
  if (!file) return;

  const preview = document.getElementById('imgPreview');
  const placeholder = document.getElementById('imgPlaceholder');

  if (file.size > 5 * 1024 * 1024) {
    showToast('Image file size must be under 5MB');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    preview.src = e.target.result;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function resetAddProductForm() {
  const form = document.querySelector('#modalAddProduct form');
  if (form) form.reset();
  const preview = document.getElementById('imgPreview');
  const placeholder = document.getElementById('imgPlaceholder');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  if (placeholder) placeholder.style.display = 'block';
}

function openAddProductModal() {
  resetAddProductForm();
  document.getElementById('productModalTitle').innerText = 'Add New Product';
  document.getElementById('editProdId').value = '';
  openModal('modalAddProduct');
}

function deleteProductRow(id) {
  if (confirm(`Are you sure you want to delete product #${id} from the catalog?`)) {
    productsList = productsList.filter(p => p.id !== id);
    renderProductTable(productsList);
    showToast(`Deleted product #${id} successfully`);
  }
}

function editProduct(id) {
  const product = productsList.find(p => p.id === id);
  if (!product) return;

  resetAddProductForm();
  
  document.getElementById('productModalTitle').innerText = 'Edit Product #' + id;
  document.getElementById('editProdId').value = id;
  
  document.getElementById('newProdName').value = product.name || '';
  document.getElementById('newProdBrand').value = product.brand || '';
  document.getElementById('newProdCat').value = product.category || 'Serum';
  document.getElementById('newProdPrice').value = product.price || 0;
  document.getElementById('newProdStock').value = product.stockQty || 0;
  document.getElementById('newProdExpiry').value = product.expiryDate || '';
  document.getElementById('newProdIngredients').value = Array.isArray(product.ingredients) ? product.ingredients.join(', ') : (product.ingredients || '');
  document.getElementById('newProdDesc').value = product.description || '';

  const rawImg = (product.images && product.images[0]) ? product.images[0] : '';
  const imgUrl = product._localImage || resolveProductImg(rawImg);
  
  const preview = document.getElementById('imgPreview');
  const placeholder = document.getElementById('imgPlaceholder');
  if (imgUrl && preview) {
    preview.src = imgUrl;
    preview.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
  }

  openModal('modalAddProduct');
}
