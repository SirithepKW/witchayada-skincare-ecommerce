/**
 * GLOWTIME — Review Component (ใช้ร่วมกันทุกหน้า)
 * ─────────────────────────────────────────────────────
 * modal เขียนรีวิว + star picker
 * ต้องมี HTML: #reviewModal, #starPicker, #reviewComment,
 *              #reviewError, #reviewSubmit, #reviewProductName
 * โหลดหลัง shared.js / ก่อน js ของหน้านั้นๆ
 *
 * หน้าไหนอยาก refresh ข้อมูลหลังรีวิวสำเร็จ
 * ให้ประกาศ window.onReviewSubmitted = function(productId) {...}
 * ─────────────────────────────────────────────────────
 */

let _reviewTarget = { productId: null, orderId: null };
let _reviewRating = 0;

function openReviewModal(productId, orderId, productName) {
  _reviewTarget = { productId, orderId: orderId || null };
  _reviewRating = 0;
  document.getElementById('reviewProductName').textContent = productName;
  document.getElementById('reviewComment').value = '';
  document.getElementById('reviewError').textContent = '';
  paintStars(0);
  openModal('reviewModal');
}

function paintStars(n) {
  document.querySelectorAll('#starPicker span').forEach(s => {
    s.classList.toggle('on', Number(s.dataset.v) <= n);
  });
}

const _starPicker = document.getElementById('starPicker');
_starPicker.addEventListener('click', e => {
  const star = e.target.closest('span[data-v]');
  if (!star) return;
  _reviewRating = Number(star.dataset.v);
  paintStars(_reviewRating);
});
_starPicker.addEventListener('mouseover', e => {
  const star = e.target.closest('span[data-v]');
  if (star) paintStars(Number(star.dataset.v));
});
_starPicker.addEventListener('mouseleave', () => paintStars(_reviewRating));

async function handleSubmitReview(e) {
  e.preventDefault();
  const errEl = document.getElementById('reviewError');
  const btn   = document.getElementById('reviewSubmit');
  const comment = document.getElementById('reviewComment').value;

  errEl.textContent = '';
  if (_reviewRating < 1) { errEl.textContent = 'กรุณาเลือกจำนวนดาว'; return false; }

  btn.disabled = true; btn.textContent = 'กำลังส่ง…';
  try {
    await _api.Reviews.create(_reviewTarget.productId, _reviewRating, comment, _reviewTarget.orderId);
    closeModal('reviewModal');
    toast('ขอบคุณสำหรับรีวิว! ⭐');
    if (typeof window.onReviewSubmitted === 'function') {
      window.onReviewSubmitted(_reviewTarget.productId);
    }
  } catch (err) {
    errEl.textContent = err.message || 'ส่งรีวิวไม่สำเร็จ';
  } finally {
    btn.disabled = false; btn.textContent = 'ส่งรีวิว';
  }
  return false;
}
