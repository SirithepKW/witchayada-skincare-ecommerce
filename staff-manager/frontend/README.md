# Staff & Manager Frontend

> **โฟลเดอร์นี้สำหรับทีม Frontend (Staff/Manager)**
> รับผิดชอบโดย: จิรดา จารุจิตร (67170501)

## Tech Stack
- React.js
- Deploy: Vercel

## API Base URL
เชื่อมต่อกับ Staff/Manager Backend

ดู API Endpoints เพิ่มเติมใน [`../backend/README.md`](../backend/README.md)

---

## Admin Dashboard — Frontend Overview

ส่วน Admin Frontend ทั้งหมดนี้เป็น **Vanilla HTML + CSS + JavaScript** 

---

### ไฟล์ ทั้งหมด

| ไฟล์ | หน้าที่ | Features หลัก |
|------|---------|---------------|
| `index.html` | Dashboard หน้าแรก | Stats cards, Revenue chart, Recent orders, Low stock alerts |
| `products.html` | จัดการสินค้า | ตารางสินค้า, Add/Edit product modal พร้อม image upload preview, Delete |
| `categories.html` | จัดการหมวดหมู่ | ตาราง render จาก JS, Add/Edit/Delete category modal |
| `orders.html` | จัดการออเดอร์ | ตารางออเดอร์, ดูรายละเอียด, เปลี่ยนสถานะ |
| `inventory.html` | คลังสินค้า (Lot/Batch) | ตาราง Batch/Lot, Supplier, Cost price, Low Stock alert |
| `customers.html` | ข้อมูลลูกค้า | Customer table, Skin Profile, View History modal (ดูประวัติ + orders), Review Moderation |
| `marketing.html` | โปรโมชั่น & Bundle | Bundle Set table, Cart Recovery Trigger |
| `coupons.html` | ระบบคูปอง | Active coupons, Usage history, Add/Edit/Delete coupon modal |
| `content.html` | รีวิว & บทความ | Review moderation (Approve/Hide/Delete), FDA Registry, Blog article list |
| `settings.html` | ตั้งค่าระบบ | My Profile + avatar upload preview, Password & Security, Notification Preferences, Store Config |

---

### ไฟล์ JavaScript หลัก

**`js/shared.js`** — login/logout, openModal/closeModal, showToast

**`js/sidebar.js`** — nav menu ทั้งหมด แบ่ง 3 กลุ่ม: Operations / Products / Growth & Settings

**`js/topbar.js`** — render header, user dropdown, Settings → `settings.html`, Logout

**`js/api.js`** — wrapper เชื่อม backend ที่ `http://localhost:5000` ถ้าไม่ตอบจะ fallback mock data

**`js/products.js`** — productsList array, renderProductTable, Add/Edit (shared modal), image preview

**`js/orders.js`** — orders table, filter by status, change order status

**`js/categories.js`** — categoriesList array, Add/Edit/Delete + re-render

**`js/coupons.js`** — couponsList array, Add/Edit/Delete coupon, toggleDiscountValueField (ซ่อนช่อง value ถ้าเป็น Free Shipping), updateStats

---

### CSS

ทุกหน้าใช้ `css/admin.css` ไฟล์เดียว ใช้ CSS Custom Properties เช่น `--dark`, `--cream`, `--border` ฯลฯ ไม่มี Tailwind หรือ Bootstrap

---

### สิ่งที่ยังต้องทำ

**Frontend:**
- 

