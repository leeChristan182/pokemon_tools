// Test script to add sample data to the database
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testDatabase() {
  console.log('🧪 Testing Database Connections...\n');

  try {
    // Test 1: Add a quiz score
    console.log('1️⃣ Testing Quiz Score...');
    const quizResponse = await axios.post(`${API_BASE}/quiz-scores`, {
      player_name: 'Test Player',
      score: 85,
      total_questions: 100,
      quiz_type: 'general'
    });
    console.log('✅ Quiz score saved:', quizResponse.data);

    // Test 2: Add a berry game score
    console.log('\n2️⃣ Testing Berry Game Score...');
    const berryResponse = await axios.post(`${API_BASE}/berry-scores`, {
      player_name: 'Berry Master',
      score: 100,
      moves: 25,
      time_seconds: 120
    });
    console.log('✅ Berry score saved:', berryResponse.data);

    // Test 3: Add a Pokemon team
    console.log('\n3️⃣ Testing Pokemon Team...');
    const teamResponse = await axios.post(`${API_BASE}/teams`, {
      team_name: 'Dream Team',
      pokemon_data: [
        { id: 25, name: 'Pikachu', type: ['electric'] },
        { id: 6, name: 'Charizard', type: ['fire', 'flying'] },
        { id: 3, name: 'Venusaur', type: ['grass', 'poison'] }
      ]
    });
    console.log('✅ Team saved:', teamResponse.data);

    // Test 4: Add a favorite
    console.log('\n4️⃣ Testing Favorite Pokemon...');
    const favoriteResponse = await axios.post(`${API_BASE}/favorites`, {
      user_id: 1,
      pokemon_id: 25,
      pokemon_name: 'Pikachu'
    });
    console.log('✅ Favorite saved:', favoriteResponse.data);

    // Test 5: Retrieve data
    console.log('\n5️⃣ Retrieving Data...');
    const allQuizScores = await axios.get(`${API_BASE}/quiz-scores`);
    console.log(`📊 Quiz Scores in DB: ${allQuizScores.data.length}`);
    
    const allBerryScores = await axios.get(`${API_BASE}/berry-scores`);
    console.log(`🍓 Berry Scores in DB: ${allBerryScores.data.length}`);
    
    const allTeams = await axios.get(`${API_BASE}/teams`);
    console.log(`👥 Teams in DB: ${allTeams.data.length}`);

    console.log('\n✅ All tests passed! Database is working correctly! 🎉');
    console.log('\n💡 Now open DB Browser and refresh to see the data!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.log('\n⚠️  Make sure your backend server is running: npm run dev');
  }
}

testDatabase();
