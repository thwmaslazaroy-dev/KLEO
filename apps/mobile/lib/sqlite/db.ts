import * as SQLite from 'expo-sqlite'

const db = SQLite.openDatabaseSync('kleo.db')

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      overdue_days INTEGER DEFAULT 0,
      rolled_over INTEGER DEFAULT 0,
      archived INTEGER DEFAULT 0,
      synced INTEGER DEFAULT 1,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS thoughts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'misc',
      archived INTEGER DEFAULT 0,
      synced INTEGER DEFAULT 1,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'misc',
      pinned INTEGER DEFAULT 0,
      archived INTEGER DEFAULT 0,
      synced INTEGER DEFAULT 1,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'misc',
      start_at TEXT NOT NULL,
      end_at TEXT,
      location TEXT,
      archived INTEGER DEFAULT 0,
      synced INTEGER DEFAULT 1,
      created_at TEXT
    );
  `)
}

export function getUnsyncedTasks() {
  return db.getAllSync<{ id: string }>('SELECT * FROM tasks WHERE synced = 0')
}

export function markSynced(table: string, id: string) {
  db.runSync(`UPDATE ${table} SET synced = 1 WHERE id = ?`, [id])
}

export default db
