const express     = require('express');
const cors        = require('cors');
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRouter    = require('./modules/auth/auth.router');
const productRouter = require('./modules/products/product.router');
const cartRouter    = require('./modules/cart/cart.router');
const orderRouter   = require('./modules/orders/order.router');
const paymentRouter = require('./modules/payments/payment.router');
const reviewRouter  = require('./modules/reviews/review.router');

const errorHandler = require('./middlewares/error.middleware');

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
  // อนุญาตทุก origin ในช่วง development
  // (null = เปิดจาก file://, localhost port ใดก็ได้)
  origin: (origin, cb) => cb(null, true),
  credentials: true,
}));
app.use(express.json());


// ── Swagger UI ─────────────────────────────────────────────
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'GLOWTIME API Docs',
    customfavIcon: '',
    swaggerOptions: {
      persistAuthorization: true,        // จำ token ไว้หลัง refresh
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
    },
    customCss: `
      .swagger-ui .topbar { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info .title { color: #e91e8c; }
      .swagger-ui .info { margin: 20px 0; }
    `,
  })
);

// ── JSON Spec endpoint (สำหรับ import เข้า Postman ได้เลย)
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── Health Check ───────────────────────────────────────────
/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: ตรวจสอบสถานะ Server
 *     description: ใช้เพื่อตรวจสอบว่า Server ทำงานอยู่หรือไม่
 *     responses:
 *       200:
 *         description: Server ทำงานปกติ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:    { type: string, example: ok }
 *                 service:   { type: string, example: GLOWTIME Customer Backend }
 *                 version:   { type: string, example: "1.0.0" }
 *                 dataMode:  { type: string, example: Mock JSON (in-memory) }
 *                 timestamp: { type: string, format: date-time }
 */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'GLOWTIME Customer Backend',
    version: '1.0.0',
    dataMode: 'Railway MySQL (Live DB)',
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/products', productRouter);
app.use('/api/cart',     cartRouter);
app.use('/api/orders',   orderRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/reviews',  reviewRouter);

// ── 404 Handler (API routes only) ──────────────────────────
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});


// ── Global Error Handler ───────────────────────────────────
app.use(errorHandler);

module.exports = app;
