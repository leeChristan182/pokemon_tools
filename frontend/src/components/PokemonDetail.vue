<template>
  <div class="details-page" v-if="pokemonLoaded">
    <!-- Back fixed below header -->
    <router-link to="/Pokedex" class="back-link">← Back to Pokedex</router-link>

    <!-- Left/Right side click areas for prev / next -->
    <div
      class="side-nav left-side"
      v-if="prevId"
      @click="goToPokemon(prevId)"
      :title="prevName ? `Prev: ${prevName}` : 'Prev'"
    >
      <div class="edge-label">←</div>
      <div class="edge-name" v-if="prevName">{{ prevName }}</div>
    </div>

    <div
      class="side-nav right-side"
      v-if="nextId"
      @click="goToPokemon(nextId)"
      :title="nextName ? `Next: ${nextName}` : 'Next'"
    >
      <div class="edge-label">→</div>
      <div class="edge-name" v-if="nextName">{{ nextName }}</div>
    </div>

    <!-- Main full-page content -->
    <div class="details-container">
      <!-- LEFT: big display box (image, name, forms) -->
      <section class="display-card">
        <div class="image-wrap">
          <img :src="pokemonSprite" :alt="pokemon?.name" class="pokemon-img" />
        </div>

        <h1 class="poke-title">#{{ pokemon.id }} {{ capitalize(pokemon.name) }}</h1>
        <div class="classification">{{ classification }}</div>

        <!-- types -->
        <div class="types-row">
          <span
            v-for="t in pokemon.types"
            :key="t.type.name"
            class="type-badge"
            :class="t.type.name"
          >
            {{ t.type.name }}
          </span>
        </div>

        <!-- forms badges -->
        <div class="forms-row" v-if="forms.length">
          <button
            v-for="f in forms"
            :key="f.name"
            :class="['form-chip', { active: f.name === pokemon.name }]"
            @click="switchForm(f)"
            :title="'Switch to ' + f.name"
          >
            {{ f.name }}
          </button>
        </div>
      </section>

      <!-- RIGHT: tabs + card (fixed height) -->
      <section class="info-card">
        <!-- Tabs -->
        <nav class="tabs">
          <button
            v-for="t in tabs"
            :key="t"
            :class="{ active: currentTab === t }"
            @click="currentTab = t"
          >
            {{ t }}
          </button>
        </nav>

        <!-- Tab content container (fixed size so tabs don't change page height) -->
        <div class="tab-panel">
          <!-- Info -->
          <div v-show="currentTab === 'Info'" class="tab-content info-tab">
            <h3 class="section-heading">Info</h3>

            <div class="types-row types-row--centered">
              <span
                v-for="t in pokemon.types"
                :key="t.type.name"
                class="type-badge"
                :class="t.type.name"
              >
                {{ t.type.name }}
              </span>
            </div>

            <div class="grid-info">
              <div>
                <strong>Height</strong>
                <div class="meta">{{ (pokemon.height / 10).toFixed(1) }} m</div>
              </div>
              <div>
                <strong>Weight</strong>
                <div class="meta">{{ (pokemon.weight / 10).toFixed(1) }} kg</div>
              </div>
              <div>
                <strong>EV Yield:</strong>
                <div class="meta">{{ evYieldText }}</div>
              </div>

              <div>
                <strong>Base EXP</strong>
                <div class="meta">{{ pokemon.base_experience }}</div>
              </div>
              <div>
                <strong>Abilities</strong>
                <div class="meta abilities">{{ abilities }}</div>
              </div>
              <div>
                <strong>Egg Groups</strong>
                <div class="meta">{{ eggGroups }}</div>
              </div>
              <div>
                <strong>Habitat</strong>
                <div class="meta">{{ habitat }}</div>
              </div>
              <div>
                <strong>Capture Rate</strong>
                <div class="meta">{{ species.capture_rate }}</div>
              </div>
              <div>
                <strong>Growth Rate</strong>
                <div class="meta">{{ growthRate }}</div>
              </div>
              <div>
                <strong>Base Happiness</strong>
                <div class="meta">{{ species.base_happiness }}</div>
              </div>
            </div>

            <div class="flavor-box">
              <em>{{ flavorText }}</em>
            </div>
          </div>

          <!-- Stats -->
          <div v-show="currentTab === 'Stats'" class="tab-content stats-tab">
            <h3 class="section-heading">Base Stats</h3>
            <div class="stats-list">
              <div v-for="s in pokemon.stats" :key="s.stat.name" class="stat-row">
                <div class="stat-name">{{ s.stat.name }}</div>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: statPct(s.base_stat) }"></div>
                </div>
                <div class="stat-value">{{ s.base_stat }}</div>
              </div>
            </div>
          </div>
          <!-- Moves -->
          <!-- Moves Tab -->
          <div v-show="currentTab === 'Moves'" class="tab-content moves-tab">
            <h3 class="section-heading">Moves</h3>
            <div class="moves-list">
              <ul>
                <li
                  v-for="move in pokemon.moves"
                  :key="move.move.name"
                  class="move-item"
                  @click="getMoveDetails(move.move.name)"
                >
                  <!-- Move row -->
                  <div class="move-row" :class="{ active: moveDetails?.name === move.move.name }">
                    <span class="move-name">{{ capitalize(move.move.name) }}</span>

                    <!-- Type badge (only when selected) -->
                    <span
                      v-if="moveDetails?.name === move.move.name"
                      class="type-badge"
                      :class="moveDetails.type.name"
                    >
                      {{ capitalize(moveDetails.type.name) }}
                    </span>
                  </div>

                  <!-- Expanded move details -->
                  <div
                    v-if="moveDetails && moveDetails.name === move.move.name"
                    class="move-details"
                  >
                    <!-- Meta row -->
                    <div class="move-meta-row">
                      <span class="move-meta"
                        >PP: <strong>{{ moveDetails.pp ?? '—' }}</strong></span
                      >
                      <span class="move-meta"
                        >Power: <strong>{{ moveDetails.power ?? '—' }}</strong></span
                      >
                      <span class="move-meta"
                        >Accuracy: <strong>{{ moveDetails.accuracy ?? '—' }}</strong></span
                      >

                      <!-- Category icon -->
                      <span class="move-meta move-class">
     <img
  v-if="moveDetails.damage_class?.name === 'physical'"
  :src="PhysicalIcon"
  alt="Physical"
/>
<img
  v-else-if="moveDetails.damage_class?.name === 'special'"
  :src="SpecialIcon"
  alt="Special"
/>
<img v-else :src="StatusIcon" alt="Status" />
                      </span>
                    </div>

                    <!-- Effect + Flavor -->
                    <div class="move-texts">
                      <p v-if="moveDetails.effect_text" class="move-effect">
                        {{ moveDetails.effect_text }}
                      </p>
                      <p v-if="moveDetails.flavor_text" class="move-flavor">
                        <em>{{ moveDetails.flavor_text }}</em>
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Weaknesses -->
          <div v-show="currentTab === 'Weaknesses'" class="tab-content weaknesses-tab">
            <h3 class="section-heading">Type Matchups</h3>

            <div class="weak-block">
              <h4>Strong Against</h4>
              <div class="types-list">
                <span v-for="t in strongAgainst" :key="t" class="type-badge" :class="t">{{
                  t
                }}</span>
                <span v-if="strongAgainst.length === 0" class="muted">None</span>
              </div>
            </div>

            <div class="weak-block">
              <h4>Weak Against</h4>
              <div class="types-list">
                <span v-for="t in weakAgainst" :key="t" class="type-badge" :class="t">{{ t }}</span>
                <span v-if="weakAgainst.length === 0" class="muted">None</span>
              </div>
            </div>

            <div class="weak-block">
              <h4>Normal Against</h4>
              <div class="types-list">
                <span v-for="t in normalAgainst" :key="t" class="type-badge" :class="t">{{
                  t
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>

  <div v-else class="loading">Loading Pokémon…</div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PhysicalIcon from '@/assets/icons/Physical.png'
import SpecialIcon from '@/assets/icons/Special.png'
import StatusIcon from '@/assets/icons/Status.png'


const route = useRoute()
const router = useRouter()

/* reactive state */
const pokemon = ref(null)
const species = ref(null)
const forms = ref([])
const moveDetails = ref(null)

const classification = ref('')
const abilities = ref('')
const eggGroups = ref('')
const habitat = ref('')
const growthRate = ref('')
const flavorText = ref('')
const evYields = computed(() => pokemon.value?.stats?.filter((s) => s.effort > 0) || [])

const strongAgainst = ref([])
const weakAgainst = ref([])
const normalAgainst = ref([])

const tabs = ['Info', 'Stats', 'Moves', 'Weaknesses']
const currentTab = ref('Info')

const prevId = ref(null)
const nextId = ref(null)
const prevName = ref('')
const nextName = ref('')

/* derived */
const pokemonLoaded = computed(() => !!pokemon.value && !!species.value)
const pokemonSprite = computed(() => {
  if (!pokemon.value) return ''
  return (
    pokemon.value.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.value.sprites?.other?.dream_world?.front_default ||
    pokemon.value.sprites?.front_default ||
    ''
  )
})
const evYieldText = computed(() => {
  if (!pokemon.value?.stats) return 'None'

  const yields = pokemon.value.stats
    .filter((s) => s.effort > 0)
    .map((s) => `${s.effort} ${capitalize(s.stat.name)}`)

  return yields.length ? yields.join(', ') : 'None'
})

/* helpers */
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')

/* percent for stats: cap relative to 255 to avoid >100% width */
const statPct = (v) => `${Math.min(100, Math.round((v / 255) * 100))}%`

/* fetch functions */
async function fetchJSON(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error('Failed fetch ' + url)
  return r.json()
}

async function fetchPokemon(idOrName) {
  try {
    // reset
    moveDetails.value = null
    strongAgainst.value = []
    weakAgainst.value = []
    normalAgainst.value = []
    forms.value = []
    currentTab.value = 'Info'

    // main pokemon resource
    const p = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${idOrName}`)
    pokemon.value = p

    // species
    species.value = await fetchJSON(p.species.url)

    // classification
    const genObj = (species.value.genera || []).find((g) => g.language?.name === 'en')
    classification.value = genObj?.genus || ''

    // abilities
    abilities.value = (p.abilities || [])
      .map((a) => `${a.ability.name}${a.is_hidden ? ' (Hidden)' : ''}`)
      .join(', ')

    eggGroups.value = (species.value.egg_groups || []).map((g) => g.name).join(', ') || '—'
    habitat.value = species.value.habitat?.name || 'Unknown'
    growthRate.value = species.value.growth_rate?.name || 'Unknown'
    flavorText.value =
      (species.value.flavor_text_entries || [])
        .find((e) => e.language?.name === 'en')
        ?.flavor_text?.replace(/\f/g, ' ') || 'No description available.'

    // forms (varieties)
    forms.value = (species.value.varieties || []).map((v) => ({
      name: v.pokemon.name,
      url: v.pokemon.url,
    }))

    // prev / next ids and names (use id from fetched resource)
    const id = p.id
    prevId.value = id > 1 ? id - 1 : null
    nextId.value = id + 1

    // fetch names for neighbor ids safely
    prevName.value = ''
    nextName.value = ''
    if (prevId.value) {
      try {
        const prevP = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${prevId.value}`)
        prevName.value = prevP.name
      } catch (e) {
        prevName.value = ''
      }
    }
    try {
      const nextP = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${nextId.value}`)
      nextName.value = nextP.name
    } catch (e) {
      nextName.value = ''
    }

    // calculate type matchups (strong/weak/normal)
    await calculateTypeMatchups(p.types.map((t) => t.type.name))
  } catch (err) {
    console.error('fetchPokemon error', err)
  }
}

/* calculate strong/weak/normal by combining type damage_relations */
async function calculateTypeMatchups(typeNames) {
  try {
    // attack multipliers: from our types to others
    const attackMult = {} // {targetType: multiplier}
    // defense multipliers: from others to us (vulnerabilities)
    const defenseMult = {}

    // initialize all known types to 1 to make normal list easier later
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
    for (const t of allTypes) {
      attackMult[t] = 1
      defenseMult[t] = 1
    }

    // fetch each type resource and combine
    for (const tName of typeNames) {
      const typeData = await fetchJSON(`https://pokeapi.co/api/v2/type/${tName}`)
      const ddTo = typeData.damage_relations.double_damage_to || []
      const hdTo = typeData.damage_relations.half_damage_to || []
      const ndTo = typeData.damage_relations.no_damage_to || []
      const ddFrom = typeData.damage_relations.double_damage_from || []
      const hdFrom = typeData.damage_relations.half_damage_from || []
      const ndFrom = typeData.damage_relations.no_damage_from || []

      ddTo.forEach((x) => {
        attackMult[x.name] = (attackMult[x.name] || 1) * 2
      })
      hdTo.forEach((x) => {
        attackMult[x.name] = (attackMult[x.name] || 1) * 0.5
      })
      ndTo.forEach((x) => {
        attackMult[x.name] = 0
      })

      ddFrom.forEach((x) => {
        defenseMult[x.name] = (defenseMult[x.name] || 1) * 2
      })
      hdFrom.forEach((x) => {
        defenseMult[x.name] = (defenseMult[x.name] || 1) * 0.5
      })
      ndFrom.forEach((x) => {
        defenseMult[x.name] = 0
      })
    }

    // strongAgainst = types where our attackMult > 1
    strongAgainst.value = Object.keys(attackMult).filter((k) => attackMult[k] > 1)
    // weakAgainst = types where defenseMult > 1 (they hit us super effectively)
    weakAgainst.value = Object.keys(defenseMult).filter((k) => defenseMult[k] > 1)
    // normalAgainst = those that are exactly 1 for both attack and defense (neutral)
    normalAgainst.value = Object.keys(attackMult).filter(
      (k) => attackMult[k] === 1 && defenseMult[k] === 1,
    )
  } catch (err) {
    console.error('calculateTypeMatchups error', err)
    strongAgainst.value = []
    weakAgainst.value = []
    normalAgainst.value = []
  }
}

/* switch to particular form (variety) */
function switchForm(form) {
  // navigate and let watcher fetch the new data
  if (form?.name) router.push({ path: `/pokemon/${form.name}` })
}

/* move details */
async function getMoveDetails(moveName) {
  try {
    moveDetails.value = null
    const m = await fetchJSON(`https://pokeapi.co/api/v2/move/${moveName}`)
    const flavor =
      (m.flavor_text_entries || []).find((e) => e.language?.name === 'en')?.flavor_text || ''
    moveDetails.value = {
      name: m.name,
      type: m.type,
      power: m.power,
      accuracy: m.accuracy,
      pp: m.pp,
      damage_class: m.damage_class,
      flavor_text: flavor.replace(/\f/g, ' '),
    }
    // open moves tab details visible already because we're on Moves tab when clicking
  } catch (e) {
    console.error('getMoveDetails', e)
  }
}

/* navigation helpers */
function goToPokemon(id) {
  if (!id || id < 1) return
  router.push(`/pokemon/${id}`)
}

/* watch route changes */
watch(
  () => route.params.id,
  (id) => {
    if (id) fetchPokemon(id)
  },
)

onMounted(() => {
  if (route.params.id) fetchPokemon(route.params.id)
})
</script>

<style scoped>
:root {
  --header-height: 64px;
  --card-gap: 28px;
  --accent: #2563eb;
}

/* page fills viewport under header */
.details-page {
  min-height: calc(100vh - var(--header-height));
  position: relative;
  background: linear-gradient(180deg, #fafafa, #fff);
}

/* fixed back link under header (not moving) */
.back-link {
  position: absolute;
  top: calc(var(--header-height) + 10px);
  left: 20px;
  z-index: 60;
  background: transparent;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

/* left/right edge nav (full height clickable) */
.side-nav {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(0, 0, 0, 0.35); /* darker baseline */
  transition:
    background 0.2s ease,
    color 0.2s ease;
  cursor: pointer;
  z-index: 40;
  user-select: none;
}
.side-nav:hover {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.85);
}
.left-side {
  left: 0;
}
.right-side {
  right: 0;
}
.side-nav .edge-label {
  font-size: 28px;
  font-weight: bold;
}
.side-nav .edge-name {
  font-size: 13px;
  font-weight: 600;
}

/* main two-column layout (fills width) */
.details-container {
  max-width: 1200px;
  margin: 0 auto; /* centers the whole section */
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: var(--card-gap);
  padding: calc(var(--header-height) + 24px) 24px 48px 24px;
  align-items: start;
}
/* left display card */
.display-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - var(--header-height) - 96px);
  box-sizing: border-box;
}

/* image scale and containment */
.image-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
}
.pokemon-img {
  max-width: 100%;
  max-height: 48vh;
  object-fit: contain;
  transform-origin: center;
  transition: transform 0.25s ease;
  will-change: transform;
}

/* title & classification */
.poke-title {
  font-size: clamp(18px, 2.2vw, 28px);
  margin: 12px 0 4px;
  text-transform: capitalize;
}
.classification {
  color: #666;
  margin-bottom: 12px;
}

/* types row */
.types-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 14px;
  justify-content: center;
}
.type-badge {
  padding: 6px 10px;
  border-radius: 999px;
  color: #fff;
  font-weight: 700;
  text-transform: capitalize;
  font-size: 13px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* form chips */
.forms-row {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.form-chip {
  background: #f3f4f6;
  border: none;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}
.form-chip.active {
  background: var(--accent);
  color: #fff;
}

/* right info card */
.info-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
  min-height: calc(100vh - var(--header-height) - 96px);
  display: flex;
  flex-direction: column;
  height: 630px;
}

/* tabs */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.tabs button {
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: #e5e7eb;
  color: #374151;
  cursor: pointer;
  font-weight: 600;
}
.tabs button.active {
  background: #2563eb;
  color: #fff;
}

.form-chip {
  background: #e5e7eb;
  color: #374151;
  border: none;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}
.form-chip.active {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
}
.tab-panel {
  flex: 1;
  min-height: calc(100vh - var(--header-height) - 220px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tab-content {
  padding: 8px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Info layout grid */
.info-tab .grid-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 18px;
  margin: 12px 0;
}
.meta {
  color: #333;
  margin-top: 6px;
}
.abilities {
  font-weight: 600;
}

/* flavor box */
.flavor-box {
  margin-top: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #fbfdff;
  border-left: 4px solid var(--accent);
  font-style: italic;
  color: #444;
}

/* stats */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.stat-name {
  width: 110px;
  text-transform: capitalize;
  font-weight: 600;
}
.stat-bar {
  flex: 1;
  height: 12px;
  background: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.35s ease;
}

.stat-value {
  width: 44px;
  text-align: right;
  font-weight: 700;
}

/* moves */
.move-item {
  list-style: none;
  margin-bottom: 8px;
  cursor: pointer;
}

.move-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f7f7f9;
  transition:
    background 0.2s,
    transform 0.15s;
}

.move-row:hover {
  background: #eef1f6;
  transform: translateX(2px);
}

.move-row.active {
  background: #e6f0ff;
  border-left: 4px solid #3b82f6;
}

.move-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #222;
}

.type-badge {
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  text-transform: capitalize;
  color: white;
}

/* Example type colors */
.type-badge.normal {
  background: #a8a77a;
}
.type-badge.grass {
  background: #7ac74c;
}
.type-badge.poison {
  background: #a33ea1;
}
.type-badge.fire {
  background: #ee8130;
}
/* (etc for other types...) */

.move-details {
  margin-top: 8px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.move-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #444;
}

.move-meta strong {
  font-weight: 600;
}

.move-class img {
  width: 20px;
  height: 20px;
}

.move-texts {
  margin-top: 6px;
}

.move-effect {
  margin-bottom: 6px;
  font-size: 0.92rem;
  line-height: 1.4;
  color: #2b2b2b;
}

.move-flavor {
  font-size: 0.85rem;
  color: #666;
}

/* weaknesses layout */
.weak-block {
  margin-top: 12px;
}
.types-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.muted {
  color: #8b8b90;
}

/* small responsive adjustments */
@media (max-width: 980px) {
  .details-container {
    grid-template-columns: 1fr;
    padding-top: calc(var(--header-height) + 14px);
  }
  .side-nav {
    display: none;
  }
  .display-card {
    min-height: auto;
  }
  .info-card {
    min-height: auto;
  }
}

/* ---------- type colour map (copy same colours used on cards) ---------- */
.type-badge.normal {
  background: #a8a878;
}
.type-badge.fire {
  background: #f08030;
}
.type-badge.water {
  background: #6890f0;
}
.type-badge.electric {
  background: #f8d030;
  color: #111;
}
.type-badge.grass {
  background: #78c850;
}
.type-badge.ice {
  background: #98d8d8;
  color: #111;
}
.type-badge.fighting {
  background: #c03028;
}
.type-badge.poison {
  background: #a040a0;
}
.type-badge.ground {
  background: #e0c068;
  color: #111;
}
.type-badge.flying {
  background: #a890f0;
  color: #111;
}
.type-badge.psychic {
  background: #f85888;
}
.type-badge.bug {
  background: #a8b820;
  color: #111;
}
.type-badge.rock {
  background: #b8a038;
  color: #111;
}
.type-badge.ghost {
  background: #705898;
}
.type-badge.dark {
  background: #705848;
}
.type-badge.dragon {
  background: #7038f8;
}
.type-badge.steel {
  background: #b8b8d0;
  color: #111;
}
.type-badge.fairy {
  background: #f0b6bc;
  color: #111;
}

/* form active highlight */
.form-chip.active {
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.18);
}

/* small loading state */
.loading {
  padding: 40px;
  text-align: center;
  color: #444;
  font-weight: 600;
}
</style>
