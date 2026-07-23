const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GLOWTIME — Staff & Manager Backend API',
      version: '1.0.0',
      description: `
## ระบบร้านจำหน่ายสกินแคร์ออนไลน์ GLOWTIME

API สำหรับฝั่ง **Staff** (พนักงาน) และ **Manager** (ผู้จัดการ) ครอบคลุม:
- 🔐 **Auth** — เข้าสู่ระบบ (staff / manager)
- 📦 **Orders** — จัดการคำสั่งซื้อ (Staff)
- 🚚 **Shipments** — บันทึกข้อมูลการจัดส่ง (Staff)
- 📦 **Stock** — จัดการสต็อกสินค้า (Staff)
- 🧴 **Products** — จัดการข้อมูลสินค้า (Manager)
- 📊 **Reports** — รายงานยอดขายและสต็อก (Manager)
- 👥 **Users** — จัดการบัญชีผู้ใช้ (Manager)

> **หมายเหตุ:** ปัจจุบันใช้ **Mock JSON (in-memory)** แทน MySQL
> เมื่อพร้อม ให้แทนที่ \`src/config/store.js\` ด้วย MySQL2 queries

### การ Authenticate
ใช้ **Bearer Token (JWT)** — รับ token จาก \`POST /api/auth/login\` แล้วใส่ใน header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

### Mock Accounts (password: \`password123\`)
| Email | Role |
|-------|------|
| staff@glowtime.com | staff |
| manager@glowtime.com | manager |
      `,
      contact: {
        name: 'GLOWTIME Dev Team',
        email: 'glowtime@dev.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Local Development Server (Mock Data)',
      },
      {
        url: 'https://glowtime-staff-api.onrender.com',
        description: 'Production Server (Render)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'รับ token จาก POST /api/auth/login แล้วใส่ที่นี่',
        },
      },
      schemas: {
        // ── User ────────────────────────────────────────────
        AdminUser: {
          type: 'object',
          properties: {
            id:        { type: 'integer', example: 10 },
            username:  { type: 'string',  example: 'kant_staff' },
            email:     { type: 'string',  format: 'email', example: 'staff@glowtime.com' },
            role:      { type: 'string',  enum: ['staff', 'manager'], example: 'staff' },
            position:  { type: 'string',  example: 'warehouse', nullable: true },
            createdAt: { type: 'string',  format: 'date-time' },
          },
        },
        // schema ครอบคลุมทุก role (customer / staff / manager)
        AnyUser: {
          type: 'object',
          properties: {
            id:        { type: 'integer', example: 1 },
            username:  { type: 'string',  example: 'naphatsorn_k' },
            email:     { type: 'string',  format: 'email', example: 'customer@glowtime.com' },
            role:      { type: 'string',  enum: ['customer', 'staff', 'manager'], example: 'customer' },
            position:  { type: 'string',  example: 'warehouse', nullable: true },
            createdAt: { type: 'string',  format: 'date-time' },
            profile: {
              type: 'object',
              nullable: true,
              properties: {
                skinType: { type: 'string', example: 'sensitive' },
                phone:    { type: 'string', example: '081-234-5678' },
              },
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                user:  { $ref: '#/components/schemas/AdminUser' },
              },
            },
          },
        },
        // ── Product ─────────────────────────────────────────
        Product: {
          type: 'object',
          properties: {
            id:             { type: 'integer',  example: 1001 },
            name:           { type: 'string',   example: 'Hyaluronic Acid Serum 30ml' },
            brand:          { type: 'string',   example: 'GlowLab' },
            category:       { type: 'string',   example: 'Serum' },
            skinTypeTarget: { type: 'array', items: { type: 'string' }, example: ['dry', 'sensitive'] },
            ingredients:    { type: 'array', items: { type: 'string' }, example: ['Hyaluronic Acid', 'Panthenol'] },
            description:    { type: 'string' },
            price:          { type: 'number',   example: 590 },
            stockQty:       { type: 'integer',  example: 120 },
            expiryDate:     { type: 'string',   example: '2027-05-01' },
            images:         { type: 'array', items: { type: 'string' } },
            averageRating:  { type: 'number',   example: 4.6 },
            reviewCount:    { type: 'integer',  example: 38 },
          },
        },
        // ── Order ───────────────────────────────────────────
        Order: {
          type: 'object',
          properties: {
            id:          { type: 'integer', example: 1 },
            orderId:     { type: 'string',  example: 'ORD-20260701-0001' },
            customerId:  { type: 'integer', example: 1 },
            status: {
              type: 'string',
              enum: ['pending_payment', 'confirmed', 'shipping', 'delivered'],
              example: 'confirmed',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  orderItemId: { type: 'integer' },
                  productId:   { type: 'integer' },
                  productName: { type: 'string' },
                  qty:         { type: 'integer' },
                  unitPrice:   { type: 'number' },
                  subtotal:    { type: 'number' },
                },
              },
            },
            totalAmount:     { type: 'number',  example: 1180 },
            shippingAddress: {
              type: 'object',
              properties: {
                recipient:  { type: 'string', example: 'นภัสสร ใส่ใจผิว' },
                address:    { type: 'string', example: '123/45 ถ.สุขุมวิท' },
                province:   { type: 'string', example: 'กรุงเทพมหานคร' },
                postalCode: { type: 'string', example: '10110' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Shipment ─────────────────────────────────────────
        Shipment: {
          type: 'object',
          properties: {
            id:             { type: 'integer', example: 501 },
            orderId:        { type: 'string',  example: 'ORD-20260701-0001' },
            trackingNumber: { type: 'string',  example: 'TH123456789EX' },
            carrier: {
              type: 'string',
              enum: ['Kerry Express', 'Flash Express', 'Thailand Post'],
              example: 'Kerry Express',
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_transit', 'delivered'],
              example: 'in_transit',
            },
            shippedAt:    { type: 'string', format: 'date-time' },
            deliveredAt:  { type: 'string', format: 'date-time', nullable: true },
          },
        },
        // ── Stock ────────────────────────────────────────────
        StockUpdate: {
          type: 'object',
          required: ['stockQty'],
          properties: {
            stockQty: { type: 'integer', minimum: 0, example: 150 },
          },
        },
        // ── Report ───────────────────────────────────────────
        SalesReport: {
          type: 'object',
          properties: {
            totalOrders:   { type: 'integer', example: 4 },
            totalRevenue:  { type: 'number',  example: 3300.00 },
            deliveredCount:{ type: 'integer', example: 2 },
            shippingCount: { type: 'integer', example: 1 },
            confirmedCount:{ type: 'integer', example: 1 },
            topProducts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId:   { type: 'integer' },
                  productName: { type: 'string' },
                  totalQty:    { type: 'integer' },
                  totalRevenue:{ type: 'number' },
                },
              },
            },
          },
        },
        StockReport: {
          type: 'object',
          properties: {
            totalProducts:    { type: 'integer', example: 6 },
            lowStockProducts: { type: 'integer', example: 2 },
            outOfStock:       { type: 'integer', example: 0 },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'integer' },
                  name:      { type: 'string' },
                  stockQty:  { type: 'integer' },
                  status:    { type: 'string', enum: ['ok', 'low', 'out'] },
                },
              },
            },
          },
        },
        // ── Common ──────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data:    { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string',  example: 'เกิดข้อผิดพลาด' },
          },
        },
      },
    },
    tags: [
      { name: 'Health',    description: '🏥 ตรวจสอบสถานะ Server' },
      { name: 'Auth',      description: '🔐 เข้าสู่ระบบ (staff / manager)' },
      { name: 'Orders',    description: '📦 จัดการคำสั่งซื้อ (Staff)' },
      { name: 'Shipments', description: '🚚 บันทึกข้อมูลการจัดส่ง (Staff)' },
      { name: 'Stock',     description: '📦 จัดการสต็อกสินค้า (Staff)' },
      { name: 'Products',  description: '🧴 จัดการสินค้า (Manager)' },
      { name: 'Reports',   description: '📊 รายงาน (Manager)' },
      { name: 'Users',     description: '👥 จัดการบัญชีผู้ใช้ (Manager)' },
    ],
  },
  apis: ['./src/app.js', './src/modules/**/*.router.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
