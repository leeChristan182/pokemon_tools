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
          
          <!-- Edited badge -->
          <div v-if="selectedItem.edited" class="edited-badge">✏️ Edited</div>
          
          <img :src="selectedItem.sprite" class="modal-image" />
          <p><strong>Category:</strong> {{ formatCategory(selectedItem.category) }}</p>
          <p><strong>Cost:</strong> {{ displayCost }}</p>
          <p class="effect-text">{{ displayEffect }}</p>
          
          <p v-if="selectedItem.customNotes" class="custom-notes">
            <strong>📝 Your Notes:</strong><br />
            {{ selectedItem.customNotes }}
          </p>
          
          <!-- Edit Controls -->
          <div class="edit-controls">
            <button @click="openEditModal" class="btn-edit">
              <span>✏️</span> {{ selectedItem.edited ? 'Edit Again' : 'Edit Info' }}
            </button>
            <button v-if="selectedItem.edited" @click="revertEdits" class="btn-revert">
              <span>↺</span> Revert to Original
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h2>Edit {{ formatName(selectedItem?.name || '') }}</h2>
        
        <div class="form-group">
          <label>Effect Description</label>
          <textarea 
            v-model="editForm.effect_description" 
            rows="4"
            placeholder="Enter custom effect description..."
          ></textarea>
          <small>Original: {{ originalEffect }}</small>
        </div>

        <div class="form-group">
          <label>Cost</label>
          <input 
            v-model.number="editForm.cost" 
            type="number"
            placeholder="e.g., 3000"
            min="0"
          />
          <small>Original: {{ selectedItem?.cost || 0 }}</small>
        </div>

        <div class="form-group">
          <label>Your Personal Notes</label>
          <textarea 
            v-model="editForm.custom_notes" 
            rows="3"
            placeholder="Add your own notes about this item..."
          ></textarea>
        </div>

        <div class="modal-actions">
          <button @click="saveEdits" class="btn-save" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
          <button @click="closeEditModal" class="btn-cancel" :disabled="saving">
            Cancel
          </button>
        </div>
        
        <div v-if="saveError" class="error-message">{{ saveError }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const items = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('all')
const categories = ref([])
const selectedItem = ref(null)
const page = ref(1)
const perPage = 100

/* edit state */
const showEditModal = ref(false)
const saving = ref(false)
const saveError = ref('')
const editForm = ref({
  effect_description: '',
  cost: 0,
  custom_notes: ''
})

async function fetchItems() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/item?limit=1000')
    const data = await response.json()
    const detailedItems = await Promise.all(
      data.results.map(async (i) => {
        const res = await fetch(i.url)
        const info = await res.json()
        
        // Extract item ID from URL
        const urlParts = i.url.split('/').filter(Boolean)
        const itemId = parseInt(urlParts[urlParts.length - 1])
        
        return {
          id: itemId,
          name: info.name,
          sprite:
            info.sprites.default || info.sprites.other?.['official-artwork']?.front_default || '',
          category: info.category.name,
          cost: info.cost,
          effect:
            info.effect_entries.find((e) => e.language.name === 'en')?.effect || 'No effect info',
          edited: false,
          customEffect: null,
          customCost: null,
          customNotes: null
        }
      }),
    )
    items.value = detailedItems
    categories.value = [...new Set(detailedItems.map((i) => i.category))]
    
    // Fetch edited items and merge
    await fetchEditedItems()
  } catch (err) {
    console.error('Error fetching items:', err)
  } finally {
    loading.value = false
  }
}

async function fetchEditedItems() {
  try {
    const response = await axios.get('http://localhost:5000/api/edited-items')
    const editedItems = response.data
    
    // Update items with edited data
    editedItems.forEach((edited) => {
      const item = items.value.find((i) => i.id === edited.item_id)
      if (item) {
        item.edited = true
        item.customEffect = edited.effect_description
        item.customCost = edited.cost
        item.customNotes = edited.custom_notes
      }
    })
  } catch (err) {
    console.error('Error fetching edited items:', err)
  }
}

const displayCost = computed(() => {
  if (!selectedItem.value) return 0
  return selectedItem.value.customCost !== null 
    ? selectedItem.value.customCost 
    : selectedItem.value.cost
})

const displayEffect = computed(() => {
  if (!selectedItem.value) return ''
  return selectedItem.value.customEffect || selectedItem.value.effect
})

const originalEffect = computed(() => selectedItem.value?.effect || '')

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

function openEditModal() {
  if (!selectedItem.value) return
  
  editForm.value = {
    effect_description: selectedItem.value.customEffect || '',
    cost: selectedItem.value.customCost !== null ? selectedItem.value.customCost : selectedItem.value.cost,
    custom_notes: selectedItem.value.customNotes || ''
  }
  
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  saveError.value = ''
}

async function saveEdits() {
  if (!selectedItem.value) return
  
  saving.value = true
  saveError.value = ''
  
  try {
    await axios.post('http://localhost:5000/api/edited-items', {
      item_id: selectedItem.value.id,
      item_name: selectedItem.value.name,
      effect_description: editForm.value.effect_description || null,
      cost: editForm.value.cost,
      custom_notes: editForm.value.custom_notes || null
    })
    
    // Update local data
    selectedItem.value.edited = true
    selectedItem.value.customEffect = editForm.value.effect_description || null
    selectedItem.value.customCost = editForm.value.cost
    selectedItem.value.customNotes = editForm.value.custom_notes || null
    
    closeEditModal()
  } catch (err) {
    console.error('Error saving edits:', err)
    saveError.value = 'Failed to save changes. Please try again.'
  } finally {
    saving.value = false
  }
}

async function revertEdits() {
  if (!selectedItem.value || !selectedItem.value.edited) return
  
  if (!confirm('Are you sure you want to revert to the original data?')) return
  
  try {
    await axios.delete(`http://localhost:5000/api/edited-items/${selectedItem.value.id}`)
    
    // Reset local data
    selectedItem.value.edited = false
    selectedItem.value.customEffect = null
    selectedItem.value.customCost = null
    selectedItem.value.customNotes = null
  } catch (err) {
    console.error('Error reverting edits:', err)
    alert('Failed to revert changes. Please try again.')
  }
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
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  letter-spacing: 2px;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Only affects the word "Pokémon" */
.pokemon-text {
  display: inline-block; /* ensures styles don't leak into Pokédex */
  color: #ffde00; /* bright visible yellow */
  -webkit-text-stroke: 2px #2a75bb; /* strong blue outline */
  text-shadow:
    0 0 3px #2a75bb,
    2px 2px 0 #3b4cca,
    3px 3px 0 #0a285f,
    0 0 8px #ffec80; /* subtle yellow glow */
  letter-spacing: 1px;
  background-clip: initial; /* reset inherited gradient */
  -webkit-background-clip: initial;
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

/* Edit Controls */
.edited-badge {
  display: inline-block;
  background: #4caf50;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.edit-controls {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-edit,
.btn-revert {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-edit {
  background: #ff9900;
  color: white;
}

.btn-edit:hover {
  background: #e68a00;
  transform: translateY(-2px);
}

.btn-revert {
  background: #666;
  color: white;
}

.btn-revert:hover {
  background: #555;
  transform: translateY(-2px);
}

.custom-notes {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-left: 3px solid #ff9900;
  border-radius: 4px;
  text-align: left;
  color: #333;
}

/* Edit Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  margin-top: 0;
  color: #ff9900;
  font-size: 1.8rem;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
}

.form-group small {
  display: block;
  margin-top: 0.4rem;
  color: #666;
  font-style: italic;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}

.btn-save,
.btn-cancel {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-save {
  background: #4caf50;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #45a049;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #ccc;
  color: #333;
}

.btn-cancel:hover:not(:disabled) {
  background: #bbb;
}

.error-message {
  margin-top: 1rem;
  padding: 0.8rem;
  background: #ffebee;
  color: #c62828;
  border-radius: 8px;
  text-align: center;
}
</style>
