<template>
  <div class="pokedex">
<h1 class="page-title">
  <span class="pokemon-text">Pokémon</span> Pokédex
</h1>

    <!-- Filters -->
    <div class="filters">
      <input v-model="search" placeholder="Search Pokémon (name or #)..." class="search-bar" />

      <!-- Type Filter -->
      <select v-model="selectedType" class="dropdown">
        <option value="">All Types</option>
        <option v-for="t in allTypes" :key="t" :value="t">{{ t }}</option>
      </select>

      <!-- Generation Filter -->
      <select v-model="selectedGen" class="dropdown">
        <option value="">All Generations</option>
        <option v-for="(range, gen) in generations" :key="gen" :value="gen">{{ gen }}</option>
      </select>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="loader">Loading all Pokémon...</div>

    <!-- Pokémon grid -->
    <div v-else class="pokemon-grid">
      <PokemonCard v-for="pokemon in paginatedPokemon" :key="pokemon.id" :pokemon="pokemon" />
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="page === 1">Prev</button>
      <button
        v-for="p in totalPages"
        :key="p"
        @click="goToPage(p)"
        :class="['page-btn', { active: p === page }]"
      >
        {{ p }}
      </button>
      <button @click="nextPage" :disabled="page === totalPages">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PokemonCard from './PokemonCard.vue'

const allPokemon = ref([]) // ✅ full dataset
const search = ref('')
const page = ref(1)
const perPage = 100
const loading = ref(false)

const selectedType = ref('')
const selectedGen = ref('')

// Generation ranges
const generations = {
  'Gen 1': [1, 151],
  'Gen 2': [152, 251],
  'Gen 3': [252, 386],
  'Gen 4': [387, 493],
  'Gen 5': [494, 649],
  'Gen 6': [650, 721],
  'Gen 7': [722, 809],
  'Gen 8': [810, 898],
  'Gen 9': [899, 1025],
}

// Types
const allTypes = [
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]

// Fetch Pokémon - optimized version with types
async function fetchAllPokemon() {
  loading.value = true
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`)
  const data = await res.json()

  // Fetch types in chunks for better performance
  const chunkSize = 100
  const allPokemonData = []
  
  for (let i = 0; i < data.results.length; i += chunkSize) {
    const chunk = data.results.slice(i, i + chunkSize)
    const chunkDetails = await Promise.all(
      chunk.map((p) => fetch(p.url).then((r) => r.json()))
    )
    allPokemonData.push(...chunkDetails)
  }

  allPokemon.value = allPokemonData.map((d) => ({
    id: d.id,
    name: d.name,
    sprite: d.sprites.front_default,
    types: d.types.map((t) => t.type.name),
  }))

  loading.value = false
}

onMounted(fetchAllPokemon)

// ✅ Filters
const filteredPokemon = computed(() => {
  let result = [...allPokemon.value]

  // Search
  if (search.value) {
    const query = search.value.toLowerCase()
    result = result.filter(
      (p) => p.name.toLowerCase().includes(query) || String(p.id).includes(query),
    )
  }

  // Type filter
  if (selectedType.value) {
    result = result.filter((p) => p.types.includes(selectedType.value))
  }

  // Generation filter
  if (selectedGen.value) {
    const [min, max] = generations[selectedGen.value]
    result = result.filter((p) => p.id >= min && p.id <= max)
  }

  return result
})

// ✅ Pagination on filtered dataset
const totalPages = computed(() => Math.ceil(filteredPokemon.value.length / perPage))

const paginatedPokemon = computed(() =>
  filteredPokemon.value.slice((page.value - 1) * perPage, page.value * perPage),
)

function nextPage() {
  if (page.value < totalPages.value) page.value++
}
function prevPage() {
  if (page.value > 1) page.value--
}
function goToPage(p) {
  page.value = p
}
</script>

<style scoped>
.encyclopedia {
  padding: 20px;
  text-align: center;
}
.page-header {
  margin-bottom: 2rem;
}
.page-title {
  font-family: 'Pokemon Solid', sans-serif;
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(90deg, #202020, #1e1d1d, #3f3e38);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  letter-spacing: 2px;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Only affects the word “Pokémon” */
.pokemon-text {
  display: inline-block; /* ensures styles don’t leak into Pokédex */
  color: #ffde00; /* bright visible yellow */
  -webkit-text-stroke: 2px #2a75bb; /* strong blue outline */
  text-shadow:
    0 0 3px #2a75bb,
    2px 2px 0 #3b4cca,
    3px 3px 0 #0a285f,
    0 0 8px #ffec80; /* subtle yellow glow */
  letter-spacing: 1px;
  -webkit-background-clip: initial;
  background-clip: initial;
  -webkit-text-fill-color: initial;
}

/* Filters */
.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.search-bar,
.dropdown {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

/* Loader */
.loader {
  font-size: 18px;
  font-weight: bold;
  color: #3b82f6;
  margin: 20px 0;
  text-align: center;
}

/* Grid */
.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(10, 120px);
  justify-content: center;
  gap: 20px;
  margin: 0 auto;
  max-width: calc(10 * 120px + 9 * 20px);
}

/* Pagination */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.page-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: #262728;
  cursor: pointer;
  transition: all 0.2s ease;
}
.page-btn:hover {
  background: #d1d5db;
}
.page-btn.active {
  background: #3b82f6;
  color: white;
  font-weight: bold;
  transform: scale(1.1);
}
</style>
