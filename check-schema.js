// Check database schema
const db = require('./config/database');

console.log('📋 Current Database Schema:\n');

const tables = ['quiz_scores', 'berry_game_scores', 'pokedoku_games'];

tables.forEach(tableName => {
  const schema = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(tableName);
  if (schema) {
    console.log(`\n🔹 ${tableName}:`);
    console.log(schema.sql);
  }
});

console.log('\n\n📊 Checking for user_id columns:');
tables.forEach(tableName => {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasUserId = columns.find(col => col.name === 'user_id');
  console.log(`${tableName}: ${hasUserId ? '❌ Has user_id' : '✅ No user_id'}`);
});
