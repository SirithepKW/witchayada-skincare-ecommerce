/**
 * In-Memory Mock Data Store — Staff & Manager Backend
 * ─────────────────────────────────────────────────────────────────
 * โหลดข้อมูลจาก JSON files เข้าหน่วยความจำ (reset เมื่อ restart server)
 * เมื่อพร้อมเชื่อมต่อ MySQL จริง ให้แทนที่ด้วย mysql2 queries
 * ─────────────────────────────────────────────────────────────────
 */

const path = require('path');

// โหลด JSON ทั้งหมดเป็น in-memory arrays
const db = {
  users:     require(path.join(__dirname, '../data/users.json')),
  products:  require(path.join(__dirname, '../data/products.json')),
  orders:    require(path.join(__dirname, '../data/orders.json')),
  shipments: require(path.join(__dirname, '../data/shipments.json')),
};

// ── Helper: generate next ID ──────────────────────────────
const nextId = (collection) => {
  if (collection.length === 0) return 1;
  return Math.max(...collection.map((item) => item.id || 0)) + 1;
};

// ── Generic CRUD helpers ──────────────────────────────────

/**
 * ค้นหาทั้งหมดใน collection (พร้อม filter เสริม)
 * @param {string} collectionName
 * @param {Function} [filterFn] - optional filter callback
 */
const findAll = (collectionName, filterFn) => {
  const col = db[collectionName];
  return filterFn ? col.filter(filterFn) : [...col];
};

/**
 * ค้นหาด้วย id
 */
const findById = (collectionName, id) => {
  return db[collectionName].find((item) => item.id === id) || null;
};

/**
 * ค้นหาด้วย field ใดก็ได้
 */
const findOne = (collectionName, predicate) => {
  return db[collectionName].find(predicate) || null;
};

/**
 * เพิ่มข้อมูลใหม่ (auto-assign id)
 */
const create = (collectionName, data) => {
  const newItem = { id: nextId(db[collectionName]), ...data };
  db[collectionName].push(newItem);
  return newItem;
};

/**
 * อัปเดตข้อมูลใน collection ด้วย id
 */
const update = (collectionName, id, data) => {
  const index = db[collectionName].findIndex((item) => item.id === id);
  if (index === -1) return null;
  db[collectionName][index] = { ...db[collectionName][index], ...data };
  return db[collectionName][index];
};

/**
 * ลบข้อมูลออกจาก collection ด้วย id
 */
const remove = (collectionName, id) => {
  const index = db[collectionName].findIndex((item) => item.id === id);
  if (index === -1) return false;
  db[collectionName].splice(index, 1);
  return true;
};

module.exports = { db, findAll, findById, findOne, create, update, remove };
