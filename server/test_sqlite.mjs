import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync(':memory:');
const stmt = db.prepare('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
stmt.run();
const insert = db.prepare('INSERT INTO test (name) VALUES (?)');
insert.run('hello');
const select = db.prepare('SELECT * FROM test');
console.log(select.all());
