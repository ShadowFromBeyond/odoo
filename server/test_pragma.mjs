import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys = ON');
const stmt = db.prepare('PRAGMA foreign_keys');
console.log(stmt.all());
