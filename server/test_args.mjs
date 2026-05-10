import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)');
const insert = db.prepare('INSERT INTO test (name, age) VALUES (?, ?)');
insert.run('hello', 42);
const select = db.prepare('SELECT * FROM test WHERE name = ? AND age = ?');
console.log(select.get('hello', 42));
