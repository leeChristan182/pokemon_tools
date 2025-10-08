<template>
  <div class="games-hub">
    <h1 class="page-title">🎮 Pokémon Games Hub</h1>

    <!-- Game Cards -->
    <div class="game-cards">
      <div
        v-for="(game, index) in gameList"
        :key="index"
        class="game-card"
        :class="{ active: activeGame?.name === game.name }"
        @click="selectGame(game)"
      >
        <img :src="game.image" :alt="game.name" />
        <h3>{{ game.name }}</h3>
        <p>{{ game.desc }}</p>
      </div>
    </div>

    <!-- Active Game Section -->
    <transition name="fade">
      <div v-if="activeGame" class="active-game" ref="activeGameRef">
        <component :is="activeGame.component" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import BerryMemoryGame from './BerryMemoryGame.vue'
import PokemonQuiz from './PokemonQuiz.vue'
import PokeDokuGame from './Pokedoku.vue'

// List of games
const gameList = [
  {
    name: 'Berry Memory Match',
    desc: 'Flip cards and match all the berries!',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sitrus-berry.png',
    component: BerryMemoryGame,
  },
  {
    name: 'Pokédoku',
    desc: 'Solve Pokémon Sudoku puzzles!',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png', // unique icon (can replace with a silhouette)
    component: PokeDokuGame,
  },
  {
    name: 'Pokémon Quiz',
    desc: 'Test your Pokémon knowledge!',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/132.png', // silhouette of Ditto as example
    component: PokemonQuiz,
  },
]

const activeGame = ref(null)
const inGame = ref(false)
const activeGameRef = ref(null)

function selectGame(game) {
  if (activeGame.value && inGame.value && activeGame.value.name !== game.name) {
    if (!confirm('Switching games will reset your current progress. Continue?')) return
  }

  if (activeGame.value?.name === game.name) {
    // Toggle off if the same game is clicked again
    activeGame.value = null
    inGame.value = false
  } else {
    activeGame.value = game
    inGame.value = true

    // Scroll to game after DOM update
    nextTick(() => {
      activeGameRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}
</script>

<style scoped>
.games-hub {
  text-align: center;
  padding: 2rem;
  min-height: 100vh;
}

.page-title {
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #ff4081, #2196f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.game-cards {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.game-card {
  width: 220px;       /* slightly smaller than before but wider */
  padding: 0.6rem 1rem; /* reduce height */
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-card img {
  width: 50px;       
  height: 50px;
  object-fit: contain;
  margin-bottom: 0.5rem;
}

.game-card h3 {
  font-size: 1.05rem;
  margin: 0.3rem 0;
}

.game-card p {
  font-size: 0.85rem;
  margin: 0;
}

.game-card.active {
  transform: scale(1.05);
  border: 2px solid #2196f3;
  box-shadow: 0 0 12px rgba(33, 150, 243, 0.5);
}

.game-card:hover {
  transform: translateY(-5px);
}

/* Fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Active Game Section */
.active-game {
  margin-top: 2rem;
}
</style>
