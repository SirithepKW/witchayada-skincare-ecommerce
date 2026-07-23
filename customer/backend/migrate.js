require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  console.log('✅ Connected to Railway MySQL');

  // ── 1. Add shipping + payment columns to orders ──
  const [cols] = await conn.query('SHOW COLUMNS FROM orders');
  const colNames = cols.map((c) => c.Field);
  console.log('Current orders columns:', colNames.join(', '));

  const toAdd = [
    ['shipping_recipient', 'VARCHAR(200)'],
    ['shipping_address',   'TEXT'],
    ['shipping_province',  'VARCHAR(100)'],
    ['shipping_postal',    'VARCHAR(10)'],
    ['payment_method',     'VARCHAR(50)'],
  ];

  for (const [col, type] of toAdd) {
    if (!colNames.includes(col)) {
      await conn.query(`ALTER TABLE orders ADD COLUMN ${col} ${type}`);
      console.log('✅ Added column:', col);
    } else {
      console.log('⏭  Column exists:', col);
    }
  }

  // ── 2. Hash plain-text passwords ──
  const [users] = await conn.query('SELECT user_id, password_hash FROM users');
  const HASH_PREFIX = '$2';

  for (const u of users) {
    if (!u.password_hash.startsWith(HASH_PREFIX)) {
      const hashed = await bcrypt.hash(u.password_hash, 10);
      await conn.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashed, u.user_id]);
      console.log('✅ Hashed password for user_id:', u.user_id);
    } else {
      console.log('⏭  Password already hashed for user_id:', u.user_id);
    }
  }

  await conn.end();
  console.log('\n🎉 Migration complete!');
})().catch((e) => {
  console.error('❌ ERROR:', e.message);
  process.exit(1);
});
