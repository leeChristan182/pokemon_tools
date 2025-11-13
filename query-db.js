// Quick script to query the database from command line
const db = require('./config/database');

console.log('\n📊 Database Query Tool\n');

// Get all tables
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  ORDER BY name
`).all();

console.log('📁 Available Tables:');
tables.forEach(table => console.log(`  - ${table.name}`));

// Example: Show all quiz scores
console.log('\n🎯 Recent Quiz Scores:');
const quizScores = db.prepare(`
  SELECT * FROM quiz_scores 
  ORDER BY completed_at DESC 
  LIMIT 5
`).all();

if (quizScores.length > 0) {
  console.table(quizScores);
} else {
  console.log('  No quiz scores yet.');
}

// Example: Show all berry game scores
console.log('\n🍓 Recent Berry Game Scores:');
const berryScores = db.prepare(`
  SELECT * FROM berry_game_scores 
  ORDER BY completed_at DESC 
  LIMIT 5
`).all();

if (berryScores.length > 0) {
  console.table(berryScores);
} else {
  console.log('  No berry game scores yet.');
}

// Show table counts
console.log('\n📈 Database Statistics:');
const stats = {
  'Quiz Scores': db.prepare('SELECT COUNT(*) as count FROM quiz_scores').get().count,
  'Berry Scores': db.prepare('SELECT COUNT(*) as count FROM berry_game_scores').get().count,
  'Pokedoku Games': db.prepare('SELECT COUNT(*) as count FROM pokedoku_games').get().count,
};
console.table(stats);

db.close();
