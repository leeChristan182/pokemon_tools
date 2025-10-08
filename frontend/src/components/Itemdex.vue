<template>
  <div class="item-encyclopedia">
    <!-- Modern Title -->
<h1 class="page-title">
  <span class="pokemon-text">Pokémon</span> Itemdex
</h1>


    <!-- Search + Filter -->
    <div class="toolbar">
      <input v-model="searchQuery" type="text" placeholder="Search items..." />
      <select v-model="selectedCategory">
        <option value="all">All Categories</option>
        <option v-for="cat in categories" :key="cat" :value="cat">
          {{ formatCategory(cat) }}
        </option>
      </select>
    </div>

    <!-- Grid -->
    <div v-if="loading" class="loading">Loading items...</div>
    <div v-else class="item-grid">
      <div
        v-for="item in paginatedItems"
        :key="item.name"
        class="item-card"
        @click="selectItem(item)"
      >
        <img :src="item.sprite" :alt="item.name" class="item-image" />
        <p class="item-name">{{ formatName(item.name) }}</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="!loading">
      <button @click="page--" :disabled="page === 1">◀ Prev</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button @click="page++" :disabled="page >= totalPages">Next ▶</button>
    </div>

    <!-- Modal -->
    <transition name="modal-fade">
      <div v-if="selectedItem" class="item-modal-backdrop" @click.self="selectedItem = null">
        <div class="item-modal">
          <div class="modal-header">
            <h2>{{ formatName(selectedItem.name) }}</h2>
            <button class="close-btn" @click="selectedItem = null">×</button>
          </div>
          <img :src="selectedItem.sprite" class="modal-image" />
          <p><strong>Category:</strong> {{ formatCategory(selectedItem.category) }}</p>
          <p><strong>Cost:</strong> {{ selectedItem.cost }}</p>
          <p class="effect-text">{{ selectedItem.effect }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const items = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('all')
const categories = ref([])
const selectedItem = ref(null)
const page = ref(1)
const perPage = 100

async function fetchItems() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/item?limit=1000') // fetch all items
    const data = await response.json()
    const detailedItems = await Promise.all(
      data.results.map(async (i) => {
        const res = await fetch(i.url)
        const info = await res.json()
        return {
          name: info.name,
          sprite:
            info.sprites.default || info.sprites.other?.['official-artwork']?.front_default || '',
          category: info.category.name,
          cost: info.cost,
          effect:
            info.effect_entries.find((e) => e.language.name === 'en')?.effect || 'No effect info',
        }
      }),
    )
    items.value = detailedItems
    categories.value = [...new Set(detailedItems.map((i) => i.category))]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const filteredItems = computed(() =>
  items.value.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory =
      selectedCategory.value === 'all' || i.category === selectedCategory.value
    return matchesSearch && matchesCategory
  }),
)

const totalPages = computed(() => Math.ceil(filteredItems.value.length / perPage))
const paginatedItems = computed(() =>
  filteredItems.value.slice((page.value - 1) * perPage, page.value * perPage),
)

function formatName(name) {
  return name.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}
function formatCategory(cat) {
  return cat.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}
function selectItem(item) {
  selectedItem.value = item
}

onMounted(fetchItems)
</script>

<style scoped>
.item-encyclopedia {
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
  -webkit-background-clip: initial; /* reset inherited gradient */
  -webkit-text-fill-color: initial;
}

/* Toolbar */
.toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.toolbar input,
.toolbar select {
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 1rem;
  box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.1);
}

/* Grid */
.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 1rem;
  justify-items: center;
  width: 100%;
  max-width: 1400px;
}

/* Card */
.item-card {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
  width: 100%;
  max-width: 120px;
  aspect-ratio: 1/1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ddd;
}
.item-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}
.item-image {
  width: 70px;
  height: 70px;
  object-fit: contain;
  margin-bottom: 0.5rem;
}
.item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  text-align: center;
  text-transform: capitalize;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  gap: 1rem;
}
.pagination button {
  background: #ffcc00;
  color: #222;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}
.pagination button:hover:not(:disabled) {
  background: #ffe47a;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination span {
  color: #333;
  font-size: 1rem;
}

/* Modal */
.item-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.item-modal {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h2 {
  color: #ff9900;
  font-size: 1.8rem;
  margin: 0;
}
.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #ff9900;
  cursor: pointer;
}
.close-btn:hover {
  color: #ffcc00;
}
.modal-image {
  width: 100px;
  height: 100px;
  margin: 1rem 0;
}
.effect-text {
  font-style: italic;
  color: #555;
  margin-top: 0.5rem;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
