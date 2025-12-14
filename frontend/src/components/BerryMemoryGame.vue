<template>
  <div class="memory-game">
    <h1 class="game-title">Pokémon Memory Match!</h1>

    <!-- Grid Size Selector -->
    <div class="grid-selector">
      <label>Grid Size:</label>
      <select v-model="gridSize" :disabled="gameStarted">
        <option v-for="size in gridOptions" :key="size" :value="size">{{ size }} x {{ size }}</option>
      </select>
    </div>

    <!-- Game Grid -->
<div class="grid-wrapper" v-if="gameStarted">
  <div
    class="game-grid"
    :style="{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }"
  >
    <div v-for="(tile, index) in tiles" :key="index" class="tile" @click="revealTile(index)">
      <div class="tile-inner" :class="{ flipped: tile.revealed || tile.matched }">
        <div class="tile-front"></div>
        <div class="tile-back" :style="{ backgroundImage: `url(${tile.sprite})` }"></div>
      </div>
    </div>
  </div>
</div>

    <!-- Score Board -->
    <div class="score-board" v-if="gameStarted">
      <span>Score: {{ score }}</span>
      <span>Moves: {{ moves }}</span>
      <span>Time: {{ elapsedTime }}s</span>
    </div>

    <!-- Controls -->
    <div class="controls">
      <button class="control-btn start" @click="startGame" :disabled="gameStarted">▶ Start</button>
      <button class="control-btn pause" @click="togglePause" v-if="gameStarted">
        {{ isPaused ? '▶ Resume' : '⏸ Pause' }}
      </button>
      <button class="control-btn reset" @click="resetGame" :disabled="!gameStarted">🔁 Reset</button>
    </div>

    <!-- Win Popup -->
    <div v-if="showWinPopup" class="win-popup">
      <div class="popup-content">
        <h2>🎉 You Win!</h2>
        <p>Grid Size: {{ gridSize }}x{{ gridSize }}</p>
        <p>Time: {{ elapsedTime }}s</p>
        <p>Moves: {{ moves }}</p>

        <button class="popup-btn" @click="showLeaderboard = !showLeaderboard">
          {{ showLeaderboard ? 'Hide Leaderboard' : 'View Leaderboard' }}
        </button>

        <div v-if="showLeaderboard" class="leaderboard">
          <ul>
            <li v-for="(entry, i) in leaderboard" :key="i">
              <strong>{{ entry.name || 'Anonymous' }}</strong> — {{ entry.grid }}x{{ entry.grid }} — {{ entry.time }}s, {{ entry.moves }} moves
            </li>
          </ul>
        </div>

        <button class="popup-btn close" @click="closePopup">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { berries } from '@/data/berries.js' // import your 64 unique berries
import axios from 'axios'

// Grid options
const gridOptions = [4, 6, 8]
const gridSize = ref(4)

// Game state
const tiles = reactive([])
const score = ref(0)
const moves = ref(0)
const flippedIndices = ref([])

const gameStarted = ref(false)
const isPaused = ref(false)
const elapsedTime = ref(0)
const startTime = ref(null)
let timerInterval = null

const showWinPopup = ref(false)
const leaderboard = ref([])
const showLeaderboard = ref(false)

// ✅ Utility
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Start game
function startGame() {
  if (gameStarted.value) return
  initGame()
  gameStarted.value = true
  isPaused.value = false
}

// Initialize game
function initGame() {
  score.value = 0
  moves.value = 0
  flippedIndices.value = []
  elapsedTime.value = 0
  showWinPopup.value = false

  if (timerInterval) clearInterval(timerInterval)
  startTime.value = Date.now()
  timerInterval = setInterval(() => {
    if (!isPaused.value) elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)

  const totalTiles = gridSize.value * gridSize.value
  const numPairs = totalTiles / 2
  if (numPairs > berries.length) {
    alert('Grid too large for unique berries. Reduce size.')
    return
  }

  const selectedItems = shuffleArray([...berries]).slice(0, numPairs)
  let pairs = []
  selectedItems.forEach(item => {
    pairs.push({ ...item, revealed: false, matched: false })
    pairs.push({ ...item, revealed: false, matched: false })
  })

  shuffleArray(pairs)
  tiles.splice(0, tiles.length, ...pairs)
}

// Reveal tile
function revealTile(index) {
  if (!gameStarted.value || isPaused.value) return
  const tile = tiles[index]
  if (!tile || tile.revealed || tile.matched) return
  if (flippedIndices.value.length >= 2) return

  tile.revealed = true
  flippedIndices.value.push(index)

  if (flippedIndices.value.length === 2) {
    moves.value++
    setTimeout(checkMatch, 600)
  }
}

// Check match
function checkMatch() {
  const [i1, i2] = flippedIndices.value
  if (!tiles[i1] || !tiles[i2]) return

  if (tiles[i1].name === tiles[i2].name) {
    tiles[i1].matched = true
    tiles[i2].matched = true
    score.value++
  } else {
    tiles[i1].revealed = false
    tiles[i2].revealed = false
  }

  flippedIndices.value = []

  if (score.value === tiles.length / 2) endGame()
}

// End game
function endGame() {
  clearInterval(timerInterval)
  showWinPopup.value = true
  saveToLeaderboard()
}

// Leaderboard
async function saveToLeaderboard() {
  // Prompt for name first
  const playerName = prompt('Enter your name for the leaderboard:') || 'Anonymous'
  
  const record = { 
    name: playerName,
    grid: gridSize.value, 
    time: elapsedTime.value, 
    moves: moves.value 
  }
  
  // Save to localStorage (for offline backup)
  const existing = JSON.parse(localStorage.getItem('memory_leaderboard') || '[]')
  existing.push(record)
  existing.sort((a, b) => a.time - b.time || a.moves - b.moves)
  leaderboard.value = existing.slice(0, 10)
  localStorage.setItem('memory_leaderboard', JSON.stringify(leaderboard.value))
  
  // Save to backend database
  try {
    await axios.post('/api/berry-scores', {
      player_name: playerName,
      score: score.value,
      moves: moves.value,
      time_seconds: elapsedTime.value
    })
  } catch (error) {
    console.error('Failed to save score to database:', error)
    // Don't show alert - score is already saved locally
  }
}

// Controls
function resetGame() {
  clearInterval(timerInterval)
  gameStarted.value = false
  initGame()
}

function togglePause() {
  isPaused.value = !isPaused.value
}

function closePopup() {
  showWinPopup.value = false
}

// Load leaderboard
onMounted(async () => {
  // Load from localStorage first
  leaderboard.value = JSON.parse(localStorage.getItem('memory_leaderboard') || '[]')
  
  // Try to load from backend
  try {
    const response = await axios.get('/api/berry-scores?limit=10')
    if (response.data && response.data.length > 0) {
      leaderboard.value = response.data
    }
  } catch (error) {
    // Use local leaderboard as fallback
  }
})

onBeforeUnmount(() => {
  clearInterval(timerInterval)
  tiles.splice(0)
  flippedIndices.value = []
})
</script>


<style scoped>
.memory-game {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Title */
.game-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #ff9800;
  margin-bottom: 1rem;
}

/* Grid selector */
.grid-selector {
  margin-bottom: 1rem;
}
.grid-selector select {
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-weight: bold;
}

/* Score board */
.score-board {
  display: flex;
  gap: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

/* Game grid */
.game-grid {
  display: grid;
  gap: 10px;
  justify-content: center;
  margin-bottom: 1rem;
}

.tile {
  width: 80px;
  height: 80px;
  perspective: 600px;
  cursor: pointer;
}

.tile-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  border-radius: 12px;
}

.tile-inner.flipped {
  transform: rotateY(180deg);
}

.tile-front,
.tile-back {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tile-front {
  background: #fff8f0;
  border: 2px solid #ffcc80;
}

.tile-back {
  transform: rotateY(180deg);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border: 2px solid #ffa726;
  background-color: #fff3e0;
}

/* Controls */
.controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.control-btn {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}
.control-btn.start { background: #4caf50; color: #fff; }
.control-btn.pause { background: #ff9800; color: #fff; }
.control-btn.reset { background: #f44336; color: #fff; }
.control-btn:hover { opacity: 0.85; }

/* Win popup */
.win-popup {
  position: fixed;
  inset: 0;
  background: rgba(50,50,50,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.popup-content {
  background: #fff3e0;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  width: 360px;
}
.popup-btn {
  margin-top: 0.5rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  background: #ff9800;
  color: white;
  transition: 0.2s;
}
.popup-btn.close { background: #f44336; }
.leaderboard {
  margin-top: 1rem;
  text-align: left;
  max-height: 200px;
  overflow-y: auto;
  border-top: 1px solid #ccc;
  padding-top: 0.5rem;
}
</style>
