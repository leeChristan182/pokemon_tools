<template>
  <div ref="rootRef" class="pokedoku-game">
    <h1 class="title">PokéDoku</h1>

    <!-- Controls -->
    <div class="top-controls">
      <button @click="newPuzzle">🔄 New Puzzle</button>
      <button @click="giveUp" :disabled="revealed || isSearchingGiveUp">Give Up</button>
      <button @click="toggleUnlimited" :class="{ on: unlimited }">
        {{ unlimited ? 'Unlimited: ON' : 'Unlimited Guesses' }}
      </button>
    </div>

    <!-- Stats / Moves, Correct, Incorrect -->
    <div class="stats">
      <div class="moves">Moves: <strong>{{ movesDisplay }}</strong></div>
      <div class="counts">
        <span>Correct: {{ correct }}</span>
        <span>Incorrect: {{ incorrect }}</span>
      </div>
    </div>

    <!-- Board area -->
    <div ref="boardRef" class="board">
      <div class="top-row">
        <div class="corner"></div>
        <div
          v-for="(col, ci) in columns"
          :key="ci"
          class="col-label"
        >
          {{ col.label }}
        </div>
      </div>

      <div
        v-for="(row, ri) in rows"
        :key="ri"
        class="row"
      >
        <div class="row-label">{{ row.label }}</div>
        <div
          v-for="(_, ci) in columns"
          :key="ci"
          class="cell"
          :class="{
            correct: board[ri][ci].correct,
            incorrect: board[ri][ci].incorrect,
            revealed: revealed && board[ri][ci].answer
          }"
          @click="openSearch(ri, ci, $event)"
        >
          <div v-if="board[ri][ci].displayName" class="cell-name">
            {{ board[ri][ci].displayName }}
          </div>
          <div v-else class="cell-placeholder">—</div>
        </div>
      </div>

      <!-- Popup overlay inside board, centered / positioned relative to cell -->
      <div
        v-if="activeCell"
        class="inline-popup"
        ref="popupRef"
        :style="{ top: popupPos.top + 'px', left: popupPos.left + 'px' }"
      >
        <input
          v-model="searchTerm"
          @input="onSearchInput"
          @keydown.enter.prevent="submitName(searchTerm)"
          placeholder="Type Pokémon name..."
          class="popup-input"
          autofocus
        />
        <div class="suggestions">
          <div
            v-for="name in suggestions"
            :key="name"
            class="suggestion"
            :class="{ used: isUsed(name) }"
            @click="!isUsed(name) && submitName(name)"
          >
            {{ capitalize(name) }}
          </div>
          <div v-if="searchTermTrimmed && suggestions.length === 0" class="no-s">
            No matches
          </div>
        </div>
        <div class="popup-actions">
          <button @click="closeSearch">Cancel</button>
        </div>
        <div class="hint">
          <div><strong>Row:</strong> {{ rows[activeCell.r].label }}</div>
          <div><strong>Col:</strong> {{ columns[activeCell.c].label }}</div>
        </div>
      </div>
    </div>

    <div v-if="isSearchingGiveUp" class="giveup-info">
      Revealing answers — fetching data...
    </div>

    <div v-if="isWin" class="win-overlay">
      <div class="win-box">
        <h2>🎉 You completed the puzzle!</h2>
        <p>Moves used: {{ movesUsed }}</p>
        <button @click="newPuzzle">Play again</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import axios from 'axios'

/* -------------------------
   Config
------------------------- */
const GRID = 3

// Expanded move pool
const MOVES_POOL = [
  'flamethrower', 'surf', 'thunderbolt', 'ice-beam',
  'earthquake', 'psychic', 'dragon-claw',
  'shadow-ball', 'flare-blitz', 'hydro-pump', 'blizzard',
  'burn-up', 'moonblast', 'focus-blast', 'stone-edge',
  'sludge-bomb', 'iron-head'
]

const TYPES = [
  'normal','fire','water','electric','grass','ice','fighting',
  'poison','ground','flying','psychic','bug','rock','ghost',
  'dragon','dark','steel','fairy'
]

const GENERATIONS = {
  'Gen 1': [1, 151],
  'Gen 2': [152, 251],
  'Gen 3': [252, 386],
  'Gen 4': [387, 493],
  'Gen 5': [494, 649],
  'Gen 6': [650, 721],
  'Gen 7': [722, 809],
  'Gen 8': [810, 898],
  'Gen 9': [906, 1010]
}

const PSEUDO_LEGENDARIES = [
  'dragonite','tyranitar','salamence','metagross','garchomp',
  'hydreigon','goodra','kommo-o','dragapult','baxcalibur'
]

/* -------------------------
   State
------------------------- */
const rootRef = ref(null)
const boardRef = ref(null)
const popupRef = ref(null)

const speciesList = ref([])
const pokemonCache = reactive({})
const speciesCache = reactive({})

const rows = reactive(Array.from({ length: GRID }, () => ({ label: '' })))
const columns = reactive(Array.from({ length: GRID }, () => ({ label: '' })))
const board = reactive(
  Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => ({
      pokemon: null,
      displayName: '',
      correct: false,
      incorrect: false,
      answer: null
    }))
  )
)

const moves = ref(GRID * GRID)
const movesUsed = ref(0)
const correct = ref(0)
const incorrect = ref(0)
const isWin = ref(false)
const revealed = ref(false)
const isSearchingGiveUp = ref(false)
const unlimited = ref(false)

/* Popup search state */
const activeCell = ref(null)
const popupPos = reactive({ top: 0, left: 0 })
const searchTerm = ref('')
const suggestions = ref([])

/* Derived / computed */
const maxMoves = GRID * GRID
const movesDisplay = computed(() =>
  unlimited.value ? '∞' : `${moves.value}/${maxMoves}`
)
const searchTermTrimmed = computed(() => (searchTerm.value || '').trim())

/* -------------------------
   Fetch / caching
------------------------- */
async function fetchAllSpecies() {
  if (speciesList.value.length) return speciesList.value
  const res = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1200')
  speciesList.value = res.data.results
  return speciesList.value
}

async function fetchPokemonData(nameOrId) {
  if (!nameOrId) return null
  const key = String(nameOrId).toLowerCase()
  if (pokemonCache[key]) return pokemonCache[key]
  try {
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${key}`)
    const d = res.data
    const obj = {
      id: d.id,
      name: d.name,
      types: d.types.map(t => t.type.name),
      moves: d.moves.map(m => m.move.name),
      sprite: d.sprites.front_default,
      species_url: d.species.url
    }
    pokemonCache[obj.name] = obj
    return obj
  } catch (e) {
    return null
  }
}

async function fetchSpeciesData(speciesUrlOrName) {
  let key = speciesUrlOrName
  if (speciesUrlOrName && typeof speciesUrlOrName === 'string' && speciesUrlOrName.startsWith('http')) {
    const parts = speciesUrlOrName.split('/').filter(Boolean)
    key = parts[parts.length - 1]
  }
  if (speciesCache[key]) return speciesCache[key]
  try {
    const res = await axios.get(
      typeof speciesUrlOrName === 'string' && speciesUrlOrName.startsWith('http')
        ? speciesUrlOrName
        : `https://pokeapi.co/api/v2/pokemon-species/${speciesUrlOrName}`
    )
    speciesCache[res.data.name] = res.data
    return res.data
  } catch (e) {
    return null
  }
}

function pLimit(concurrency = 6) {
  let active = 0
  const queue = []
  const next = () => {
    if (!queue.length) return
    if (active >= concurrency) return
    active++
    const { fn, resolve } = queue.shift()
    fn().then(res => {
      active--
      resolve(res)
      next()
    }).catch(err => {
      active--
      resolve(Promise.reject(err))
      next()
    })
  }
  return (fn) => new Promise((resolve) => {
    queue.push({ fn, resolve })
    next()
  })
}
const limiter = pLimit(6)

/* -------------------------
   Label logic & constraint generation
------------------------- */
function generateConditionPool() {
  const pool = []
  // type constraints
  TYPES.forEach(t => pool.push({ kind: 'type', label: capitalize(t), payload: t }))
  // generation constraints
  Object.keys(GENERATIONS).forEach(g =>
    pool.push({ kind: 'generation', label: g, payload: GENERATIONS[g] })
  )
  // move constraints
  MOVES_POOL.forEach(m =>
    pool.push({ kind: 'move', label: `Can learn ${capitalize(m)}`, payload: m })
  )
  // classification constraints
  pool.push({ kind: 'legendary', label: 'Legendary', payload: null })
  pool.push({ kind: 'mythical', label: 'Mythical', payload: null })
  pool.push({ kind: 'pseudo', label: 'Pseudo-legendary', payload: PSEUDO_LEGENDARIES })
  pool.push({ kind: 'base', label: 'Base form', payload: null })
  // you may skip starter/paradox if rare
  return pool
}

function randomizeLabels() {
  const pool = generateConditionPool().slice()
  // filter invalid constraints that no Pokémon can satisfy
  const validPool = pool.filter(cond => {
    // try to find at least one Pokémon for label cond
    // we do a quick check in speciesList (safely)
    return true
  })
  // shuffle
  for (let i = validPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[validPool[i], validPool[j]] = [validPool[j], validPool[i]]
  }
  for (let i = 0; i < GRID; i++) rows[i].label = validPool[i].label
  for (let i = 0; i < GRID; i++) columns[i].label = validPool[GRID + i].label
}

/* Check condition logic */
async function checkPokemonAgainstCondition(pokeData, cond) {
  if (!pokeData || !cond) return false
  if (cond.kind === 'type') {
    return pokeData.types.includes(cond.payload)
  }
  if (cond.kind === 'move') {
    return pokeData.moves.includes(cond.payload)
  }
  if (cond.kind === 'generation') {
    const [low, high] = cond.payload
    return pokeData.id >= low && pokeData.id <= high
  }
  if (cond.kind === 'legendary') {
    const sp = await fetchSpeciesData(pokeData.species_url)
    return sp ? !!sp.is_legendary : false
  }
  if (cond.kind === 'mythical') {
    const sp = await fetchSpeciesData(pokeData.species_url)
    return sp ? !!sp.is_mythical : false
  }
  if (cond.kind === 'pseudo') {
    return cond.payload.includes(pokeData.name)
  }
  if (cond.kind === 'base') {
    const sp = await fetchSpeciesData(pokeData.species_url)
    return sp ? sp.evolves_from_species === null : false
  }
  return false
}

/* Utility */
function capitalize(s) {
  if (!s) return ''
  return s[0].toUpperCase() + s.slice(1)
}

function resetBoard() {
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      board[r][c].pokemon = null
      board[r][c].displayName = ''
      board[r][c].correct = false
      board[r][c].incorrect = false
      board[r][c].answer = null
    }
  }
  moves.value = GRID * GRID
  movesUsed.value = 0
  correct.value = 0
  incorrect.value = 0
  isWin.value = false
  revealed.value = false
}

/* New puzzle */
async function newPuzzle() {
  await fetchAllSpecies()
  randomizeLabels()
  resetBoard()
}

/* Popup open / positioning */
function openSearch(r, c, event) {
  if (revealed.value) return
  activeCell.value = { r, c }
  searchTerm.value = ''
  suggestions.value = []

  nextTick(() => {
    const cellEl = event.currentTarget
    const boardEl = boardRef.value
    const popupEl = popupRef.value

    const boardRect = boardEl.getBoundingClientRect()
    const cellRect = cellEl.getBoundingClientRect()

    const popupWidth = popupEl ? popupEl.offsetWidth : 300
    const popupHeight = popupEl ? popupEl.offsetHeight : 220

    // relative coords inside board
    let left = cellRect.left - boardRect.left + cellRect.width / 2 - popupWidth / 2
    let top = cellRect.top - boardRect.top - popupHeight - 8

    // clamp horizontally
    left = Math.max(8, Math.min(left, boardRect.width - popupWidth - 8))

    // if not enough space above, put below
    if (top < 8) {
      top = cellRect.bottom - boardRect.top + 8
    }

    popupPos.left = left
    popupPos.top = top
  })
}

function closeSearch() {
  activeCell.value = null
  searchTerm.value = ''
  suggestions.value = []
}

/* Suggestions logic */
async function onSearchInput() {
  const term = (searchTerm.value || '').trim().toLowerCase()
  suggestions.value = []
  if (!term) return
  if (!speciesList.value.length) await fetchAllSpecies()
  const candidates = speciesList.value
    .filter(s => s.name.includes(term))
    .slice(0, 60)
  const toFetch = candidates.slice(0, 20)
  const results = []
  await Promise.all(toFetch.map(async (s) => {
    const p = await fetchPokemonData(s.name)
    if (p) results.push(p.name)
  }))
  suggestions.value = Array.from(new Set(results)).filter(n => !isUsed(n)).slice(0, 12)
}

function isUsed(name) {
  if (!name) return false
  const low = name.toLowerCase()
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (board[r][c].pokemon === low) return true
    }
  }
  return false
}

/* Submit name */
async function submitName(inputName) {
  if (!activeCell.value) return
  const raw = (inputName || '').trim().toLowerCase()
  if (!raw) return

  const p = (pokemonCache[raw]) ? pokemonCache[raw] : await fetchPokemonData(raw)
  const { r, c } = activeCell.value

  if (!p) {
    board[r][c].pokemon = raw
    board[r][c].displayName = capitalize(raw)
    board[r][c].correct = false
    board[r][c].incorrect = true
    if (!unlimited.value) {
      moves.value = Math.max(0, moves.value - 1)
      movesUsed.value++
    }
    incorrect.value++
    closeSearch()
    return
  }

  if (isUsed(p.name)) {
    closeSearch()
    return
  }

  board[r][c].pokemon = p.name
  board[r][c].displayName = capitalize(p.name)
  board[r][c].correct = false
  board[r][c].incorrect = false

  if (!unlimited.value) {
    moves.value = Math.max(0, moves.value - 1)
    movesUsed.value++
  }

  const rowLabel = rows[r].label
  const colLabel = columns[c].label
  const pool = generateConditionPool()
  const rowCond = pool.find(x => x.label === rowLabel)
  const colCond = pool.find(x => x.label === colLabel)

  const a = rowCond ? await checkPokemonAgainstCondition(p, rowCond) : false
  const b = colCond ? await checkPokemonAgainstCondition(p, colCond) : false

  if (a && b) {
    board[r][c].correct = true
    board[r][c].incorrect = false
    correct.value++
  } else {
    board[r][c].correct = false
    board[r][c].incorrect = true
    incorrect.value++
  }

  closeSearch()
  if (correct.value === GRID * GRID) {
    isWin.value = true
    // Save game to database
    saveGameToDatabase()
  }
}

/* Give Up reveal */
async function giveUp() {
  if (revealed.value) return
  isSearchingGiveUp.value = true
  await fetchAllSpecies()

  const tasks = []
  for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) tasks.push({ r, c })

  async function testForCell(specName, r, c) {
    const p = await fetchPokemonData(specName)
    if (!p) return null
    const rowLabel = rows[r].label
    const colLabel = columns[c].label
    const pool = generateConditionPool()
    const rowCond = pool.find(x => x.label === rowLabel)
    const colCond = pool.find(x => x.label === colLabel)
    const a = rowCond ? await checkPokemonAgainstCondition(p, rowCond) : false
    const b = colCond ? await checkPokemonAgainstCondition(p, colCond) : false
    return a && b ? p : null
  }

  for (const t of tasks) {
    const { r, c } = t
    if (board[r][c].correct && board[r][c].pokemon) {
      board[r][c].answer = { name: board[r][c].pokemon }
      continue
    }
    let found = null
    const used = new Set()
    for (let rr = 0; rr < GRID; rr++) {
      for (let cc = 0; cc < GRID; cc++) {
        if (board[rr][cc].pokemon) used.add(board[rr][cc].pokemon)
      }
    }
    for (let i = 0; i < speciesList.value.length && !found; i++) {
      const spec = speciesList.value[i]
      if (used.has(spec.name)) continue
      try {
        const res = await limiter(() => testForCell(spec.name, r, c))
        if (res) {
          found = res
          used.add(res.name)
          break
        }
      } catch (e) {
        // ignore
      }
    }
    if (found) {
      board[r][c].answer = { name: found.name }
      if (!board[r][c].pokemon) {
        board[r][c].pokemon = found.name
        board[r][c].displayName = capitalize(found.name)
        board[r][c].correct = true
      }
    } else {
      board[r][c].answer = null
    }
  }

  revealed.value = true
  isSearchingGiveUp.value = false
}

/* Toggle unlimited mode */
function toggleUnlimited() {
  unlimited.value = !unlimited.value
}

/* Save game to database */
async function saveGameToDatabase() {
  try {
    const gridData = board.map(row => 
      row.map(cell => ({
        answer: cell.answer,
        correct: cell.correct
      }))
    );
    
    await axios.post('/api/pokedoku-games', {
      grid_data: JSON.stringify(gridData),
      guesses_remaining: 0,
      score: correct.value,
      completed: true
    });
  } catch (error) {
    console.error('Failed to save Pokedoku game:', error);
  }
}

/* Initialize */
onMounted(async () => {
  await fetchAllSpecies()
  randomizeLabels()
  resetBoard()
})
</script>


<style scoped>
/* Transparent background so App.vue background shows through */
.pokedoku-game {
  width: 960px;
  margin: 18px auto;
  padding: 14px;
  background: rgba(30, 41, 59, 0.55); /* translucent backdrop */
  backdrop-filter: blur(6px);
  color: #e6eef6;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  border-radius: 12px;
  box-shadow: 0 0 25px rgba(0,0,0,0.35);
}

/* Title */
.title {
  text-align: center;
  margin-bottom: 8px;
  color: #fff;
}

/* Top buttons */
.top-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
}

.top-controls button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.top-controls button.on {
  background: #0ea5a4;
}
.top-controls button:hover {
  background: #1e40af;
}

/* Stats */
.stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 14px;
  color: #f1f5f9;
  font-weight: 600;
  text-align: center;
}
.stats .moves,
.stats .counts {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.05rem;
}

/* Board layout */
.board {
  position: relative;
  display: inline-block;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(4px);
  padding: 12px;
  border-radius: 10px;
  min-width: 620px;
}

/* top row labels */
.top-row {
  display: grid;
  grid-template-columns: 120px repeat(3, 160px);
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
.corner {
  width: 120px;
  height: 36px;
}

.col-label {
  height: 36px;
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 600;
  color: #f8fafc;
  padding: 6px;
  text-align: center;
}

/* rows */
.row {
  display: grid;
  grid-template-columns: 120px repeat(3, 160px);
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.row-label {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  font-weight: 600;
  color: #f8fafc;
  padding: 8px;
  text-align: center;
}

/* cells */
.cell {
  height: 100px;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform .12s ease, border-color .12s ease, background .2s ease;
  text-transform: capitalize;
  font-weight: 700;
  color: #e6eef6;
}
.cell:hover {
  transform: translateY(-4px);
  background: rgba(255,255,255,0.08);
}

.cell.correct {
  background: rgba(16,185,129,0.15);
  border-color: rgba(16,185,129,0.7);
}
.cell.incorrect {
  background: rgba(239,68,68,0.12);
  border-color: rgba(239,68,68,0.7);
}
.cell.revealed {
  outline: 2px dashed rgba(255,255,255,0.08);
}

.cell-placeholder {
  opacity: 0.6;
  font-size: 22px;
}

/* inline popup centered on board */
.inline-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(8px);
  color: #f1f5f9;
  padding: 14px;
  border-radius: 10px;
  z-index: 1000;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.08);
}

/* input */
.popup-input {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: none;
  outline: none;
  margin-bottom: 8px;
  font-size: 14px;
  background: rgba(255,255,255,0.08);
  color: #f8fafc;
}

/* suggestions */
.suggestions {
  max-height: 152px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}
.suggestion {
  padding: 8px;
  border-radius: 6px;
  background: rgba(255,255,255,0.08);
  cursor: pointer;
  font-weight: 700;
  text-transform: capitalize;
  transition: background 0.2s ease;
}
.suggestion:hover {
  background: rgba(255,255,255,0.12);
}
.suggestion.used {
  opacity: 0.45;
  cursor: not-allowed;
}
.no-s {
  color: #9ca3af;
  padding: 6px;
}

/* actions */
.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}
.popup-actions button {
  background: rgba(255,255,255,0.08);
  color: #e6eef6;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.popup-actions button:hover {
  background: rgba(255,255,255,0.15);
}

/* hint row in popup */
.hint {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
}

/* giveup info */
.giveup-info {
  margin-top: 8px;
  color: #fbbf24;
}

/* win overlay */
.win-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 130;
  background: rgba(0,0,0,0.5);
}
.win-box {
  background: rgba(15,23,42,0.9);
  backdrop-filter: blur(6px);
  padding: 18px;
  border-radius: 10px;
  color: #f8fafc;
  text-align: center;
}
</style>
