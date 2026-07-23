# PLAN.md — การเปลี่ยนแปลงเพื่อเชื่อม Staff/Manager Frontend กับ Backend

> **เอกสารนี้บันทึกการแก้ไขทั้งหมดที่ทำเพื่อให้ `staff-manager/frontend` เชื่อมต่อกับ `staff-manager/backend` ได้อย่างสมบูรณ์**
> อ้างอิงรูปแบบจาก `customer/frontend` + `customer/backend` เป็นตัวอย่าง

---

## สรุปปัญหาที่พบ

| # | ปัญหา | ไฟล์ที่มีปัญหา |
|---|-------|--------------|
| 1 | CORS ไม่อนุญาตให้ frontend เปิดจาก `file://` หรือ `localhost` port อื่น | `backend/src/app.js` |
| 2 | Backend ไม่ serve frontend static files (ต้องเปิดผ่าน port 5001 ได้เลย) | `backend/src/app.js` |
| 3 | Frontend ชี้ไปยัง `http://localhost:5000` แต่ backend รันที่ **port 5001** | `frontend/js/api.js` |
| 4 | `api.js` ขาด modules: Reports, Users, Shipments, Stock | `frontend/js/api.js` |
| 5 | `api.js` ส่ง `{ stock: stockQty }` แต่ backend อ่าน `req.body.stockQty` | `frontend/js/api.js` |
| 6 | `api.js` ดึง products จาก `/api/products` ไม่ใช่ `/api/manager/products` | `frontend/js/api.js` |
| 7 | `orders.js`: `approveSlip`, `promptShipOrder`, `markDelivered` ไม่ได้เรียก backend API | `frontend/js/orders.js` |
| 8 | `products.js`: `saveNewProduct`, `deleteProductRow` ไม่ได้เรียก backend API | `frontend/js/products.js` |
| 9 | `users.js`: ไม่ fetch users จาก backend เลย | `frontend/js/users.js` |
| 10 | `dashboard.js`: ไม่ fetch sales/stock reports จาก backend เลย | `frontend/js/dashboard.js` |
| 11 | `settings.html` My Profile แสดงข้อมูล hardcoded (ไม่ตรงกับ user ที่ login) | `frontend/settings.html`, `frontend/js/api.js` |
| 12 | `api.js` ขาด `AdminAuth.getProfile()` สำหรับดึงข้อมูลผู้ใช้ปัจจุบัน | `frontend/js/api.js` |
| 13 | `orders.js` mock data ไม่ตรงกับ `orders.json` (orderId / recipient / items ต่างกัน) | `frontend/js/orders.js` |
| 14 | `orders.json` ขาด field: `paymentMethod`, `phone`, `slipRef`, `trackingNo`, `approvedAt`, `deliveredAt` | `backend/src/data/orders.json` |
| 15 | `filterOrders()` ไม่เก็บ active filter state ทำให้ table หาย หลัง approveSlip/ship/deliver | `frontend/js/orders.js` |
| 16 | `updateOrderStatus()` (Quick buttons ใน modal) ไม่เรียก backend API | `frontend/js/orders.js` |
| 17 | Badge "3 Active Orders" และ filter button "All Orders (3)" hardcoded ไม่นับจากข้อมูลจริง | `frontend/orders.html` |
| 18 | `formatDateTime()` ขาดหาย — แสดง ISO string ดิบแทน localized date | `frontend/js/orders.js` |
| 19 | Filter buttons ไม่มี `id` ทำให้ JS ไม่สามารถ toggle active state ได้ | `frontend/orders.html` |

---

## การแก้ไขทั้งหมด

### 1. `staff-manager/backend/src/app.js`

**เพิ่ม CORS origin allowance** (เหมือน customer backend):
```diff
-app.use(cors());
+app.use(cors({
+  origin: (origin, cb) => cb(null, true),  // อนุญาตทุก origin ในช่วง development
+  credentials: true,
+}));
```

**เพิ่ม static serve frontend** (เหมือน customer backend):
```diff
+// Serve Staff/Manager Frontend (static)
+app.use(express.static(require('path').join(__dirname, '../../frontend')));
+
-app.use((_req, res) => {
-  res.status(404).json({ success: false, message: 'Route not found' });
+app.use('/api', (_req, res) => {
+  res.status(404).json({ success: false, message: 'API route not found' });
+});
+
+// Fallback: serve frontend for all non-API routes
+app.get('*', (_req, res) => {
+  res.sendFile(require('path').join(__dirname, '../../frontend/index.html'));
 });
```

---

### 2. `staff-manager/frontend/js/api.js`

**แก้ไขและเพิ่ม:**

- **Port**: `http://localhost:5000` → `http://localhost:5001`
- **AdminProducts.list()**: เปลี่ยน endpoint จาก `/api/products` → `/api/manager/products`
- **AdminProducts.updateStock()**: แก้ body key จาก `{ stock: stockQty }` → `{ stockQty }`
- **เพิ่ม AdminReports module**:
  - `getSales()` → `GET /api/manager/reports/sales`
  - `getStock()` → `GET /api/manager/reports/stock`
- **เพิ่ม AdminUsers module**:
  - `list(filters)` → `GET /api/manager/users`
  - `update(id, data)` → `PUT /api/manager/users/:id`
  - `delete(id)` → `DELETE /api/manager/users/:id`
- **เพิ่ม AdminShipments module**:
  - `list()` → `GET /api/staff/shipments`
  - `getByOrderId(orderId)` → `GET /api/staff/shipments/:orderId`
- **เพิ่ม AdminStock module**:
  - `list()` → `GET /api/staff/stock`
  - `update(productId, stockQty)` → `PUT /api/staff/stock/:productId`
- **Export ใหม่ใน `window.GlowtimeAdminAPI`**: เพิ่ม `Reports`, `Users`, `Shipments`, `Stock`

---

### 3. `staff-manager/frontend/js/orders.js`

- **DOMContentLoaded**: เพิ่ม `try/catch` ครอบการ fetch orders จาก backend
- **`approveSlip()`**: เปลี่ยนเป็น `async` และเรียก `GlowtimeAdminAPI.Orders.updateStatus(ord.id, 'confirmed')` ก่อน update local state
- **`promptShipOrder()`**: เปลี่ยนเป็น `async`, เรียก `updateStatus(..., 'shipping')` แล้วตามด้วย `addShipment(orderId, tracking, carrier)` จาก backend
- **`markDelivered()`**: เปลี่ยนเป็น `async` และเรียก `updateStatus(ord.id, 'delivered')` ก่อน update local state
- ทุก action handler มี `try/catch` เพื่อ graceful degradation — ถ้า backend ไม่ตอบ ยังคง update local state ได้

---

### 4. `staff-manager/frontend/js/products.js`

- **DOMContentLoaded**: เพิ่ม `try/catch` ครอบการ fetch products จาก `/api/manager/products`
- **`saveNewProduct()`**: เปลี่ยนเป็น `async`
  - กรณี **Edit**: เรียก `GlowtimeAdminAPI.Products.update(editId, prodData)` → ถ้า success ใช้ response, ถ้า fail fallback local
  - กรณี **Add**: เรียก `GlowtimeAdminAPI.Products.create(prodData)` → ถ้า success ใช้ response (รวม server-assigned id), ถ้า fail fallback local
- **`deleteProductRow()`**: เปลี่ยนเป็น `async` และเรียก `GlowtimeAdminAPI.Products.delete(id)` ก่อน filter local array

---

### 5. `staff-manager/frontend/js/users.js`

- **DOMContentLoaded**: เปลี่ยนเป็น `async` และ fetch users จาก `GlowtimeAdminAPI.Users.list()` แทน mock data
- มี `try/catch` เพื่อ fallback กลับ mock data ถ้า backend ไม่ตอบสนอง

---

### 6. `staff-manager/frontend/js/dashboard.js`

- **`initDashboardCharts()`**: แยก API fetch ออกมาเป็น `loadDashboardFromAPI()` เรียกทีหลัง
- **`loadDashboardFromAPI()`** (ฟังก์ชันใหม่):
  - Fetch `GlowtimeAdminAPI.Reports.getSales()` → update stat cards: `statTotalRevenue`, `statTotalOrders`, `statTotalRevenueMeta`
  - Fetch `GlowtimeAdminAPI.Reports.getStock()` → update: `statLowStock` และ render `lowStockAlertList` (แสดงสินค้าที่ stock ต่ำสุด 5 รายการ)
  - มี `try/catch` เพื่อ graceful degradation ถ้า backend ไม่ตอบ

  ---

## การเปลี่ยนแปลงเพิ่มเติม (My Profile — settings.html)

> **วันที่:** 23 กรกฎาคม 2026
> **เหตุผล:** หน้า My Profile แสดงข้อมูล hardcoded (Visada K. / admin@skincareshop.com) แทนข้อมูลของ user ที่ login จริง


### 7. `staff-manager/frontend/js/api.js`

**เพิ่ม `AdminAuth.getProfile()`** ที่เรียก `GET /api/auth/profile` พร้อม JWT token:
```js
async getProfile() {
  const res = await adminApiFetch('/api/auth/profile');
  return res.data; // { id, username, email, role, position, ... }
}
```

### 8. `staff-manager/frontend/settings.html` — My Profile Panel

**เปลี่ยน fields จาก hardcoded เป็น dynamic:**

| Field เดิม (hardcoded) | Field ใหม่ (dynamic) | ID | แหล่งข้อมูล |
|---|---|---|---|
| First Name = "Visada" | Username | `profileUsername` | `profile.username` |
| Last Name = "K." | Position | `profilePosition` | `profile.position` |
| Email = "admin@skincareshop.com" | Email Address (disabled) | `profileEmail` | `profile.email` |
| Role = "Super Administrator" | Role (disabled) | `profileRole` | `profile.role` |
| Avatar "VK" hardcoded | Avatar initials จาก username | `avatarInitials` | 2 ตัวแรกของ username |

**เพิ่มฟังก์ชัน `loadProfileFromBackend()`** ที่ทำงานลำดับดังนี้:
1. เรียก `GET /api/auth/profile` (มี JWT token → ได้ข้อมูลจริงจาก backend)
2. Fallback → `localStorage.glowtime_user` (เก็บไว้ตอน login)
3. Fallback → `localStorage.glowtime_current_admin`

**เพิ่มฟังก์ชัน `saveProfileChanges()`** รับ submit form และแสดง toast ยืนยัน

---

#### 9. `staff-manager/backend/src/data/orders.json`

เพิ่ม fields ให้ครบทุก record ให้ตรงกับ frontend ที่ต้องการ:

| Field ที่เพิ่ม | ค่าตัวอย่าง |
|---|---|
| `paymentMethod` | `"PromptPay QR Code"`, `"Credit Card (VISA *** 4921)"` |
| `shippingAddress.phone` | `"081-234-5678"` |
| `slipRef` | `"SLIP-20260702-9988"` |
| `trackingNo` | `"KRY-11223344-TH"`, `"FLE-55667788-TH"` |
| `approvedAt` | ISO timestamp |
| `deliveredAt` | ISO timestamp |
| `updatedAt` | ISO timestamp |

#### 10. `staff-manager/frontend/js/orders.js` (เขียนใหม่ทั้งหมด)

- **Mock data** ปรับให้ตรงกับ `orders.json` ทุก field (4 orders จาก 3)
- **`loadOrdersFromBackend()`** — ฟังก์ชัน async แยกออกมา เรียก backend แล้ว run `applyFilter()` + `updateCounters()`
- **`currentFilterStatus`** — ตัวแปร global เก็บ active filter ไว้ เพื่อให้หลัง action ยัง filter ถูกอยู่
- **`updateCounters()`** — นับ active orders จาก `ordersList` จริง อัปเดต `#activeOrdersBadge` และ `#btnFilterAll`, `#btnFilterPending`
- **`filterOrders(status)`** — toggle active class ของปุ่ม filter แล้วเรียก `applyFilter(status)`
- **`applyFilter(status)`** — render table ตาม status จริง แยกจาก `filterOrders`
- **`formatDateTime(isoString)`** — แปลง ISO string เป็น Thai locale date/time อ่านง่าย
- **`updateOrderStatus()`** — เปลี่ยนเป็น `async` เรียก `GlowtimeAdminAPI.Orders.updateStatus(ord.id, newStatus)` แล้ว fallback local
- **`approveSlip()`, `promptShipOrder()`, `markDelivered()`** — เรียก `updateCounters()` + `applyFilter()` แทน `renderOrderTable()` เพื่อ maintain filter state
- **Modal**: แสดง `phone` ใน Customer info, `formatDateTime(approvedAt/deliveredAt)` แทน hardcoded string

#### 11. `staff-manager/frontend/orders.html`

- `<span id="activeOrdersBadge">` — badge นับ active orders แบบ dynamic
- `id="btnFilterAll"`, `id="btnFilterPending"`, `id="btnFilterConfirmed"`, `id="btnFilterShipping"`, `id="btnFilterDelivered"` — ให้ JS toggle active state
- Quick Status Update heading แก้เป็น `/api/staff/orders/:id/status` (ถูกต้อง)
- ปุ่ม Quick Status Update ทุกปุ่มเป็น `btn-ghost-sm` สม่ำเสมอ

---

## API Endpoints ที่เชื่อมสำเร็จ

| Method | Endpoint | Frontend Module | หน้า |
|--------|----------|-----------------|------|
| POST | `/api/auth/login` | `AdminAuth.login()` | ทุกหน้า (login overlay) |
| GET | `/api/auth/profile` | `AdminAuth.getProfile()` | `settings.html` |
| GET | `/api/manager/products` | `AdminProducts.list()` | `products.html` |
| POST | `/api/manager/products` | `AdminProducts.create()` | `products.html` |
| PUT | `/api/manager/products/:id` | `AdminProducts.update()` | `products.html` |
| DELETE | `/api/manager/products/:id` | `AdminProducts.delete()` | `products.html` |
| PUT | `/api/staff/stock/:productId` | `AdminProducts.updateStock()` | `products.html`, `inventory.html` |
| GET | `/api/staff/stock` | `AdminStock.list()` | `inventory.html` |
| GET | `/api/staff/orders` | `AdminOrders.list()` | `orders.html`, `index.html` |
| PUT | `/api/staff/orders/:id/status` | `AdminOrders.updateStatus()` | `orders.html` |
| POST | `/api/staff/shipments` | `AdminOrders.addShipment()` | `orders.html` |
| GET | `/api/staff/shipments` | `AdminShipments.list()` | `orders.html` |
| GET | `/api/staff/shipments/:orderId` | `AdminShipments.getByOrderId()` | `orders.html` |
| GET | `/api/manager/reports/sales` | `AdminReports.getSales()` | `index.html` (dashboard) |
| GET | `/api/manager/reports/stock` | `AdminReports.getStock()` | `index.html` (dashboard) |
| GET | `/api/manager/users` | `AdminUsers.list()` | `customers.html` |
| PUT | `/api/manager/users/:id` | `AdminUsers.update()` | `customers.html` |
| DELETE | `/api/manager/users/:id` | `AdminUsers.delete()` | `customers.html` |

---

## วิธีรัน

### Backend (port 5001)
```bash
cd staff-manager/backend
npm install
npm run dev   # หรือ node server.js
```

### Frontend
เปิดผ่าน browser ได้ 2 วิธี:
1. **ผ่าน Backend** (แนะนำ): เปิด `http://localhost:5001/`
2. **เปิด HTML โดยตรง**: เปิดไฟล์ `staff-manager/frontend/index.html` ใน browser

### Login credentials (mock data)
| Email | Password | Role |
|-------|----------|------|
| `staff@glowtime.com` | `password123` | staff |
| `manager@glowtime.com` | `password123` | manager |

> **หมายเหตุ:** ถ้า backend ไม่ได้รัน ทุก module จะ fallback ไปใช้ mock data ใน local array โดยอัตโนมัติ (graceful degradation)

---

## หลักการออกแบบ (Design Decisions)

1. **Graceful Degradation**: ทุก API call มี `try/catch` — ถ้า backend ไม่ตอบสนอง UI จะยังทำงานได้ด้วย mock data
2. **Consistent Pattern**: ใช้รูปแบบเดียวกับ customer frontend (`api.js` เป็น central module, แต่ละหน้า fetch ใน `DOMContentLoaded`)
3. **No Breaking Change**: ไม่แตะโค้ดใน `customer/` เลย
4. **Auth Flow**: ใช้ JWT token เดิมจาก backend, เก็บใน `localStorage` + `sessionStorage`

---

### API Endpoint ที่เพิ่ม

| Method | Endpoint | Frontend Module | หน้า |
|--------|----------|-----------------|------|
| GET | `/api/auth/profile` | `AdminAuth.getProfile()` | `settings.html` |

### ผลลัพธ์

- Login ด้วย `staff@glowtime.com` → My Profile แสดง: **kant_staff** / staff@glowtime.com / Role: Staff / Position: warehouse
- Login ด้วย `manager@glowtime.com` → My Profile แสดง: **warakhon_mgr** / manager@glowtime.com / Role: Manager
- ถ้า backend ไม่ตอบสนอง → fallback ใช้ข้อมูลจาก localStorage ที่บันทึกไว้ตอน login

---

### API Endpoints ที่เชื่อมเพิ่ม

| Method | Endpoint | การใช้งาน |
|--------|----------|-----------|
| GET | `/api/staff/orders` | โหลด orders ทั้งหมดตอนเปิดหน้า |
| PUT | `/api/staff/orders/:id/status` | `approveSlip`, `promptShipOrder`, `markDelivered`, `updateOrderStatus` |
| POST | `/api/staff/shipments` | บันทึก tracking number + carrier หลัง ship |

### ผลลัพธ์

- หน้า Orders โหลดข้อมูลจาก `GET /api/staff/orders` จริง (ถ้า backend รัน)
- Badge "X Active Orders" นับจาก ordersList จริง
- Filter tabs แสดง count ที่อัปเดตหลังทุก action
- หลัง approveSlip / ship / deliver ตาราง refresh โดย maintain filter เดิมไว้
- `deliveredAt` / `approvedAt` แสดงเป็น Thai locale date ไม่ใช่ ISO string ดิบ
