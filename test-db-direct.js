// Direct database test - bypasses HTTP server
const QuizScore = require('./models/QuizScore');
const BerryGameScore = require('./models/BerryGameScore');

console.log('🧪 Testing Direct Database Access...\n');

try {
  // Test 1: Add quiz score
  console.log('1️⃣ Adding Quiz Score...');
  const quizScore = QuizScore.create({
    player_name: 'Test Player',
    score: 85,
    total_questions: 100,
    quiz_type: 'general'
  });
  console.log('✅ Quiz Score added:', quizScore);

  // Test 2: Add berry score
  console.log('\n2️⃣ Adding Berry Game Score...');
  const berryScore = BerryGameScore.create({
    player_name: 'Berry Master',
    score: 100,
    moves: 25,
    time_seconds: 120
  });
  console.log('✅ Berry Score added:', berryScore);

  // Retrieve and display data
  console.log('\n📊 Current Database Contents:');
  console.log('----------------------------');
  
  const allQuizScores = QuizScore.getAll(10);
  console.log(`\n🎯 Quiz Scores (${allQuizScores.length}):`);
  allQuizScores.forEach(s => {
    console.log(`  - ${s.player_name}: ${s.score}/${s.total_questions} (${s.quiz_type || 'N/A'})`);
  });

  const allBerryScores = BerryGameScore.getAll(10);
  console.log(`\n🍓 Berry Scores (${allBerryScores.length}):`);
  allBerryScores.forEach(s => {
    console.log(`  - ${s.player_name}: Score ${s.score}, Moves ${s.moves}, Time ${s.time_seconds}s`);
  });

  console.log('\n✅ Database is working correctly! 🎉');
  console.log('\n💡 Now you can:');
  console.log('   1. Open DB Browser for SQLite');
  console.log('   2. Open: C:\\Users\\User\\poke\\pokemon_tools\\pokemon_tools.db');
  console.log('   3. Click "Browse Data" tab');
  console.log('   4. Select a table to view the data!');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error(error);
}
