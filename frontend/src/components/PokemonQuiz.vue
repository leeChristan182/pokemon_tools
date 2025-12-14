<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";

const mode = ref("gen"); // "gen" or "general"
const gen = ref(1);
const quizList = ref([]);
const revealed = reactive({});
const score = ref(0);
const timeLeft = ref(300);
const timer = ref(null);
const gameActive = ref(false);
const guess = ref("");

// Wrong guess tracker
const wrongGuesses = ref(0);
const maxWrong = ref(10);

// Custom time (default 300s)
const customTime = ref(300);

// Leaderboard
const showLeaderboard = ref(false);
const leaderboard = ref([]);

// Gen ranges
const genRanges = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 898],
};

// Shuffle helper
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Load Pokémon list
function loadList() {
  const list = [];
  if (mode.value === "gen") {
    const [start, end] = genRanges[gen.value];
    for (let i = start; i <= end; i++) {
      list.push({
        id: i,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i}.png`,
      });
    }
  } else if (mode.value === "general") {
    // load ALL gens
    for (let g = 1; g <= 8; g++) {
      const [start, end] = genRanges[g];
      for (let i = start; i <= end; i++) {
        list.push({
          id: i,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i}.png`,
        });
      }
    }
  }

  quizList.value = shuffle(list);
  list.forEach(p => (revealed[p.id] = false));
}

// Start game
function startGame() {
  score.value = 0;
  wrongGuesses.value = 0;
  timeLeft.value = customTime.value;
  gameActive.value = true;
  loadList();

  if (timer.value) clearInterval(timer.value);
  timer.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      endGame();
    }
  }, 1000);
}

// Check guess
async function checkGuess() {
  const name = guess.value.toLowerCase().trim();
  if (!name) return;

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();
    const id = data.id;

    if (revealed[id] === false && quizList.value.some(p => p.id === id)) {
      revealed[id] = true;
      score.value++;
    } else {
      wrongGuesses.value++;
      if (wrongGuesses.value >= maxWrong.value) {
        endGame(true);
      }
    }
  } catch {
    wrongGuesses.value++;
    if (wrongGuesses.value >= maxWrong.value) {
      endGame(true);
    }
  }

  guess.value = "";
}

// End game
async function endGame(forced = false) {
  gameActive.value = false;
  clearInterval(timer.value);
  
  // Save score to backend database
  if (score.value > 0) {
    try {
      const playerName = prompt('Enter your name for the leaderboard:') || 'Anonymous';
      const totalPokemon = quizList.value.length;
      const quizTypeLabel = mode.value === 'gen' ? `Gen ${gen.value}` : 'All Pokemon';
      
      await axios.post('/api/quiz-scores', {
        player_name: playerName,
        score: score.value,
        total_questions: totalPokemon,
        quiz_type: quizTypeLabel
      });
      
      // Refresh leaderboard after saving
      await fetchLeaderboard();
    } catch (error) {
      console.error('Failed to save quiz score:', error);
    }
  }
}

// Fetch leaderboard
async function fetchLeaderboard() {
  try {
    const response = await axios.get('/api/quiz-scores/leaderboard');
    leaderboard.value = response.data;
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
  }
}

// Load leaderboard on mount
onMounted(() => {
  fetchLeaderboard();
});
</script>

<template>
  <div class="quiz-game">
    <!-- Setup -->
    <div v-if="!gameActive && score === 0 && wrongGuesses === 0" class="setup">
      <h2>🎮 Pokémon Quiz</h2>

      <label>
        Mode:
        <select v-model="mode">
          <option value="gen">By Generation</option>
          <option value="general">All Pokémon (Gen 1–8)</option>
        </select>
      </label>

      <div v-if="mode === 'gen'">
        <label>
          Choose Generation:
          <select v-model="gen">
            <option v-for="g in 8" :key="g" :value="g">Gen {{ g }}</option>
          </select>
        </label>
      </div>

      <label>
        Custom Time Limit (seconds):
        <input type="number" v-model="customTime" min="30" />
      </label>

      <label>
        Wrong Guess Limit:
        <input type="number" v-model="maxWrong" min="1" />
      </label>

      <button @click="startGame">Start Quiz</button>

      <!-- Leaderboard Toggle Button -->
      <button @click="showLeaderboard = !showLeaderboard" style="margin-top: 1rem;">
        {{ showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard' }}
      </button>

      <!-- Leaderboard Display -->
      <div v-if="showLeaderboard" class="leaderboard">
        <h3>🏆 Top Scores</h3>
        <ul v-if="leaderboard.length > 0">
          <li v-for="(entry, i) in leaderboard" :key="i">
            <strong>{{ entry.player_name }}</strong> — {{ entry.best_score }}/{{ entry.games_played }} games (avg: {{ Math.round(entry.avg_score) }})
          </li>
        </ul>
        <p v-else>No scores yet. Be the first!</p>
      </div>
    </div>

    <!-- Game Screen -->
    <div v-else-if="gameActive">
      <div class="status-bar">
        <h3>✅ Score: {{ score }}/{{ quizList.length }}</h3>
        <h3>⏳ Time Left: {{ timeLeft }}s</h3>
        <h3>❌ Wrong: {{ wrongGuesses }}/{{ maxWrong }}</h3>
        <button class="end-btn" @click="endGame">End Game</button>
      </div>

      <div class="guess-box">
        <input
          v-model="guess"
          placeholder="Type Pokémon name"
          @keypress.enter="checkGuess"
        />
        <button @click="checkGuess">Submit</button>
      </div>

      <div class="grid">
        <div
          v-for="p in quizList"
          :key="p.id"
          class="poke-card"
        >
          <img
            :src="p.sprite"
            :alt="p.id"
            :class="{ silhouette: !revealed[p.id] }"
          />
          <p v-if="revealed[p.id]">#{{ p.id }}</p>
        </div>
      </div>
    </div>

    <!-- Game Over -->
    <div v-else class="end-screen">
      <h2>💀 Game Over!</h2>
      <p>✅ Score: {{ score }}/{{ quizList.length }}</p>
      <p>❌ Wrong Guesses: {{ wrongGuesses }}/{{ maxWrong }}</p>
      <button @click="startGame">Play Again</button>
    </div>
  </div>
</template>
<style>
.quiz-game {
  text-align: center;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center; /* centers everything horizontally */
}

/* --- STATUS BAR --- */
.status-bar {
  display: flex;
  justify-content: center; /* center horizontally */
  align-items: center;
  margin: 1rem 0;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* --- GRID: force 10 columns per row --- */
.grid {
  display: grid;
  grid-template-columns: repeat(15, 1fr); /* 10 columns */
  gap: 0.75rem;
  justify-items: center;
  align-items: center;
  margin-top: 1rem;
  width: max-content; /* shrink to fit grid content */
  background: rgba(255, 255, 255, 0.15); /* subtle background */
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* --- CARD STYLING --- */
.poke-card {
  background: white;
  padding: 0.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.poke-card:hover {
  transform: scale(1.05);
}

.poke-card img {
  width: 85px; /* smaller for 10x10 fit */
  height: 85px;
  object-fit: contain;
  transition: filter 0.3s ease, transform 0.3s ease;
}

/* Silhouette (unrevealed) Pokémon */
.silhouette {
  filter: brightness(0);
  transform: scale(0.8); /* 20% smaller */
}

/* --- BUTTONS --- */
.end-btn {
  padding: 0.5rem 1rem;
  background: #ff4d4d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}
.end-btn:hover {
  background: #cc0000;
}

/* --- END SCREEN --- */
.end-screen {
  margin-top: 2rem;
  text-align: center;
}

/* --- RESPONSIVE ADJUSTMENTS --- */
@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(8, 1fr);
  }
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .poke-card img {
    width: 60px;
    height: 60px;
  }
}

/* --- LEADERBOARD --- */
.leaderboard {
  margin-top: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.leaderboard h3 {
  margin-top: 0;
  color: #333;
}

.leaderboard ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
}

.leaderboard li {
  background: #f8f8f8;
  margin: 0.5rem 0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.leaderboard li strong {
  color: #4CAF50;
}
</style>
