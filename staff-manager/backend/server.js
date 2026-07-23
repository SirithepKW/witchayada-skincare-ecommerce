require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║    GLOWTIME — Staff & Manager Backend        ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Server running on  : http://localhost:${PORT}  ║`);
  console.log(`║  Environment        : ${process.env.NODE_ENV || 'development'}           ║`);
  console.log('║  Data Mode          : Mock JSON (in-memory)  ║');
  console.log('║  Roles              : staff | manager        ║');
  console.log('╚══════════════════════════════════════════════╝');
});
