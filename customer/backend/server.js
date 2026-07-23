require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/store');

const PORT = process.env.PORT || 5000;

(async () => {
  // ทดสอบการเชื่อมต่อ MySQL ก่อน start server
  try {
    await testConnection();
    console.log('✅  MySQL connected to Railway successfully');
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║        GLOWTIME — Customer Backend               ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  Server running on  : http://localhost:${PORT}      ║`);
    console.log(`║  Environment        : ${(process.env.NODE_ENV || 'development').padEnd(26)}║`);
    console.log('║  Data Mode          : Railway MySQL (Live DB)    ║');
    console.log('╚══════════════════════════════════════════════════╝');
  });
})();
