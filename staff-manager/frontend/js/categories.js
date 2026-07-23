/**
 * GLOWTIME — Staff & Admin Categories Management (js/categories.js)
 * ─────────────────────────────────────────────────────────────
 */

let categoriesList = [
  { id: 1, name: 'Serum', productCount: 1, sampleProduct: 'Hydrating Serum', status: 'Active' },
  { id: 2, name: 'Moisturizer', productCount: 1, sampleProduct: 'Renewal Cream', status: 'Active' },
  { id: 3, name: 'Oil', productCount: 1, sampleProduct: 'Radiance Oil', status: 'Active' },
  { id: 4, name: 'Cleanser', productCount: 1, sampleProduct: 'Gentle Cleanser', status: 'Active' },
  { id: 5, name: 'Mist', productCount: 1, sampleProduct: 'Hydrating Mist', status: 'Active' },
  { id: 6, name: 'Mask', productCount: 1, sampleProduct: 'Glow Mask', status: 'Active' },
  { id: 7, name: 'Sunscreen', productCount: 1, sampleProduct: 'Daily SPF 50+', status: 'Active' }
];

document.addEventListener('DOMContentLoaded', () => {
  renderCategoryTable(categoriesList);
});

function renderCategoryTable(items) {
  const tbody = document.getElementById('categoryTableBody');
  if (!tbody) return;

  tbody.innerHTML = items.map(cat => `
    <tr style="border-bottom:1px solid var(--border);">
      <td style="padding:0.8rem;"><strong>${cat.name}</strong></td>
      <td style="padding:0.8rem;">${cat.productCount} Item (${cat.sampleProduct})</td>
      <td style="padding:0.8rem;">
        <span class="status-badge badge-${cat.status === 'Active' ? 'success' : 'danger'}">${cat.status}</span>
      </td>
      <td style="padding:0.8rem;">
        <button class="btn-ghost-sm" onclick="editCategory(${cat.id})">Edit</button>
        <button class="btn-ghost-sm" style="color:var(--status-danger);" onclick="deleteCategory(${cat.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function resetCategoryForm() {
  const form = document.getElementById('categoryForm');
  if (form) form.reset();
}

function openAddCategoryModal() {
  resetCategoryForm();
  document.getElementById('categoryModalTitle').innerText = 'Add New Category';
  document.getElementById('editCatId').value = '';
  openModal('modalAddCategory');
}

function editCategory(id) {
  const cat = categoriesList.find(c => c.id === id);
  if (!cat) return;

  resetCategoryForm();
  
  document.getElementById('categoryModalTitle').innerText = 'Edit Category #' + id;
  document.getElementById('editCatId').value = id;
  
  document.getElementById('catName').value = cat.name || '';
  document.getElementById('catStatus').value = cat.status || 'Active';

  openModal('modalAddCategory');
}

function deleteCategory(id) {
  if (confirm(`Are you sure you want to delete category #${id}?`)) {
    categoriesList = categoriesList.filter(c => c.id !== id);
    renderCategoryTable(categoriesList);
    showToast(`Deleted category successfully`);
  }
}

function saveCategory(e) {
  e.preventDefault();
  
  const editId = document.getElementById('editCatId').value;
  const isEdit = !!editId;

  const catData = {
    id: isEdit ? Number(editId) : Math.max(0, ...categoriesList.map(c => c.id)) + 1,
    name: document.getElementById('catName').value.trim(),
    status: document.getElementById('catStatus').value,
  };

  if (isEdit) {
    const idx = categoriesList.findIndex(c => c.id === Number(editId));
    if (idx !== -1) {
      catData.productCount = categoriesList[idx].productCount;
      catData.sampleProduct = categoriesList[idx].sampleProduct;
      categoriesList[idx] = catData;
    }
  } else {
    catData.productCount = 0;
    catData.sampleProduct = '-';
    categoriesList.unshift(catData);
  }

  renderCategoryTable(categoriesList);
  closeModal('modalAddCategory');
  resetCategoryForm();
  showToast(`Category "${catData.name}" ${isEdit ? 'updated' : 'added'} successfully!`);
}
