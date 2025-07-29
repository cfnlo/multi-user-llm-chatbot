const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../chatbot.db');
const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Rooms table
    db.run(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Room participants table
    db.run(`
      CREATE TABLE IF NOT EXISTS room_participants (
        room_id TEXT,
        user_id TEXT,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (room_id, user_id),
        FOREIGN KEY (room_id) REFERENCES rooms (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        user_id TEXT,
        content TEXT NOT NULL,
        message_type TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Invitations table
    db.run(`
      CREATE TABLE IF NOT EXISTS invitations (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        email TEXT NOT NULL,
        invited_by TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms (id),
        FOREIGN KEY (invited_by) REFERENCES users (id)
      )
    `);

    console.log('Database initialized successfully');
  });
}

// Database helper functions
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  db,
  initializeDatabase,
  runQuery,
  getQuery,
  allQuery
}; 