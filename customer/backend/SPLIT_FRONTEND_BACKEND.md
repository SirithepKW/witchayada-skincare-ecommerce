# GLOWTIME — แยก Backend (Vercel) + Frontend (GitHub Pages)

> ส่งต่อให้ Antigravity ทำตามนี้ทีละขั้น

---

## สถานะปัจจุบัน

- Backend (`customer/backend`) deploy บน Vercel แล้ว ต่อ MySQL (Railway) สำเร็จ ทำงานได้ครบทุก endpoint
- **ปัญหา**: backend ถูกเขียนให้ serve หน้า frontend ไปด้วย (`express.static` + fallback route) ทำให้ frontend กับ backend ปนกันอยู่ในโดเมนเดียว (`witchayada-skincare-ecommerce.vercel.app`)
- **เป้าหมาย**: แยกให้ backend ทำหน้าที่แค่ API เท่านั้น ส่วน frontend ไป deploy อยู่ GitHub Pages แยกต่างหาก

---

## Task 1 — ลบ static serving ออกจาก backend

**ไฟล์**: `customer/backend/src/app.js`

ลบโค้ด 2 ส่วนนี้ทิ้ง:

```js
// ── Serve Customer Frontend (static) ───────────────────────
// เปิด http://localhost:5000/ ได้เลย
app.use(express.static(require('path').join(__dirname, '../../frontend')));
```

```js
// ── Fallback: serve frontend for all non-API routes ─────────
app.get('*', (_req, res) => {
  res.sendFile(require('path').join(__dirname, '../../frontend/index.html'));
});
```

**คงไว้** (404 handler เฉพาะ API):
```js
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});
```

---

## Task 2 — แก้ frontend ให้ชี้ไป backend URL จริง

**ไฟล์**: `customer/frontend/api.js`

```js
// จากเดิม
const API_BASE = 'http://localhost:5000';

// แก้เป็น URL จริงของ backend บน Vercel
const API_BASE = 'https://witchayada-skincare-ecommerce.vercel.app';
```

> ตรวจสอบ URL จริงจาก Vercel Dashboard → โปรเจกต์ backend → Domains ก่อนใส่ (อาจไม่ตรงเป๊ะกับที่เขียนไว้ด้านบน)

---

## Task 3 — เพิ่ม CORS ให้ backend อนุญาต GitHub Pages origin (เช็คก่อน)

**ไฟล์**: `customer/backend/src/app.js`

เช็คว่า CORS config อนุญาตทุก origin อยู่แล้วหรือไม่ (ถ้าเป็นแบบนี้ ข้ามได้เลย ไม่ต้องแก้เพิ่ม):
```js
app.use(cors({ origin: (origin, cb) => cb(null, true) }));
```

ถ้า CORS ถูกจำกัด origin เฉพาะเจาะจง ให้เพิ่ม GitHub Pages URL เข้าไปในรายการที่อนุญาต เช่น `https://<username>.github.io`

---

## Task 4 — สร้าง GitHub Actions workflow deploy เฉพาะ `customer/frontend`

เพราะ repo มีหลายโฟลเดอร์ซ้อน (`customer/`, `staff-manager/`, `database/`) ไม่สามารถเลือก subfolder ตรงๆ ใน GitHub Pages settings ได้ ต้องใช้ Actions

**สร้างไฟล์ใหม่**: `.github/workflows/deploy-customer-frontend.yml`

```yaml
name: Deploy Customer Frontend to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'customer/frontend/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'customer/frontend'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## Task 5 — เปิดใช้งาน GitHub Pages ใน repo settings

1. ไปที่ repo บน GitHub → **Settings** → **Pages**
2. ในหัวข้อ **Build and deployment** → **Source** เลือก **"GitHub Actions"** (ไม่ใช่ "Deploy from a branch")
3. Push การเปลี่ยนแปลงทั้งหมด (Task 1-4) ขึ้น `main` branch
4. ไปที่แท็บ **Actions** ของ repo เช็คว่า workflow รันผ่าน (สีเขียว ✅)
5. กลับไปที่ **Settings → Pages** จะเห็น URL ที่ deploy สำเร็จ เช่น:
   ```
   https://<username>.github.io/<repo-name>/
   ```

---

## Task 6 — ทดสอบผลลัพธ์

- [ ] เปิด URL GitHub Pages → หน้าเว็บ GLOWTIME ควรขึ้นปกติ
- [ ] ลองกด "Shop" ดูว่าสินค้าโหลดมาจาก backend จริง (ไม่ใช่ error "Backend ออฟไลน์" อีก)
- [ ] เปิด Browser DevTools → tab Network → เช็คว่า request ยิงไปที่ URL Vercel backend จริง ไม่ใช่ `localhost`
- [ ] ทดสอบ login/cart/order เพื่อยืนยันว่า flow ทำงานครบ end-to-end (GitHub Pages → Vercel → Railway MySQL)

---

## หมายเหตุ

- Backend บน Vercel จะ auto-redeploy เองทุกครั้งที่ push ขึ้น `main` (ผูก GitHub ไว้แล้ว) — ไม่ต้องกด deploy ซ้ำมือ
- ถ้าแก้เฉพาะไฟล์ใน `customer/frontend/` workflow ใน Task 4 จะ trigger เฉพาะตอนมีการแก้โฟลเดอร์นั้น (ประหยัดเวลา build)
