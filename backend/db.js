const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./pedidos.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    items TEXT,
    total INTEGER,
    fecha TEXT
  )`);
});

module.exports = db;
