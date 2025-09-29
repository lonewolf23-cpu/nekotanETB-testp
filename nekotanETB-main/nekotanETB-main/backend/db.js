const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const env = process.env;
const dbFile = env.DB_FILE || path.join(__dirname, 'data', 'botdata.sqlite');

// ensure data dir exists
const dataDir = path.dirname(dbFile);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbFile);

// Initialize tables if not existing
db.exec(`
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tg_id TEXT,
  from_user TEXT,
  chat_id TEXT,
  text TEXT,
  raw_json TEXT,
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tg_id TEXT UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  last_seen DATETIME
);

CREATE TABLE IF NOT EXISTS commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  description TEXT,
  response TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric TEXT,
  value REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = db;
