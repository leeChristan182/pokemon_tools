<template>
  <div class="home-dashboard">
    <!-- HERO -->
    <section class="hero">
      <h1>Poké<span>Tools </span></h1>
      <p class="subtitle">Your hub for everything Pokémon</p>
    </section>

    <!-- QUICK NAVIGATION -->
    <section class="nav-section">
      <div class="nav-grid">
        <router-link to="/pokedex" class="nav-card">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
            alt="Pokédex"
          />
          <span>Pokédex</span>
        </router-link>

        <router-link to="/itemdex" class="nav-card">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png"
            alt="ItemDex"
          />
          <span>ItemDex</span>
        </router-link>

        <router-link to="/games" class="nav-card">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png"
            alt="Games"
          />
          <span>GamesHub</span>
        </router-link>
      </div>
    </section>

    <!-- FEATURED POKEMON CAROUSEL -->
    <section class="featured-section">
      <h2>🌟 Daily Featured Pokémon</h2>

      <Swiper
        :modules="[Autoplay]"
        :slides-per-view="3"
        :space-between="20"
        :loop="true"
        :autoplay="{ delay: 1200, disableOnInteraction: false }"
        :breakpoints="{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }"
        class="pokemon-swiper"
      >
        <SwiperSlide v-for="p in featuredPokemons" :key="p.name">
          <div class="pokemon-card" @click="goToPokemon(p.name)">
            <img :src="p.image" :alt="p.name" />
            <p>{{ capitalize(p.name) }}</p>
          </div>
        </SwiperSlide>
      </Swiper>

      <div v-if="!featuredPokemons.length" class="loading">
        <div class="loader"></div>
        <p>Loading featured Pokémon...</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/autoplay'

const router = useRouter()
const featuredPokemons = ref([])

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const goToPokemon = (name) => router.push(`/pokemon/${name}`)

// ✅ Daily seed (changes once per day)
function getDailyRandomIds(count = 10) {
  const dateSeed = new Date().toISOString().split('T')[0]
  let seed = [...dateSeed].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const ids = []
  for (let i = 0; i < count; i++) {
    seed = (seed * 9301 + 49297) % 233280
    ids.push((seed % 898) + 1)
  }
  return ids
}

async function loadFeaturedPokemons() {
  const ids = getDailyRandomIds(10)
  const data = await Promise.all(
    ids.map((id) => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json())),
  )
  featuredPokemons.value = data.map((p) => ({
    name: p.name,
    image: p.sprites.other['official-artwork'].front_default,
  }))
}

onMounted(loadFeaturedPokemons)
</script>

<style scoped>
/* --- GLOBAL LAYOUT --- */
.home-dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  background:transparent;
  color: #212121;
  position: relative;
  overflow: hidden;
}

/* Subtle animated background shapes */
.home-dashboard::before {
  content: '';
  position: absolute;
  top: -10%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #90caf9 20%, transparent 70%);
  filter: blur(100px);
  opacity: 0.4;
}
.home-dashboard::after {
  content: '';
  position: absolute;
  bottom: -10%;
  left: -10%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #ffcc80 20%, transparent 70%);
  filter: blur(100px);
  opacity: 0.4;
}

/* --- HERO --- */
.hero {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
}
.hero h1 {
  font-size: 3.2rem;
  font-weight: 900;
  color: #1a237e;
  letter-spacing: -1px;
}
.hero h1 span {
  color: #e53935;
}
.subtitle {
  font-size: 1.1rem;
  font-weight: 500;
  color: #3949ab;
  margin-top: 0.5rem;
}

/* --- NAVIGATION --- */
.nav-section {
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 2;
}
.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 900px;
}
.nav-card {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 1.25rem;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  text-align: center;
  padding: 1.2rem 1rem;
  text-decoration: none;
  color: #212121;
  font-weight: 600;
  transition: all 0.3s ease;
}
.nav-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.2);
}
.nav-card img {
  width: 70px;
  height: 70px;
  margin-bottom: 0.6rem;
}

/* --- FEATURED SECTION --- */
.featured-section {
  margin-top: 3rem;
  width: 100%;
  max-width: 1100px;
  text-align: center;
}
.featured-section h2 {
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: #e53935;
}

/* --- CAROUSEL --- */
.pokemon-swiper {
  width: 100%;
  padding: 1.2rem 0;
}
.pokemon-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  padding: 1.2rem;
  cursor: pointer;
  transition: all 0.25s ease;
}
.pokemon-card:hover {
  transform: scale(1.07);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
.pokemon-card img {
  width: 100%;
  height: 140px;
  object-fit: contain;
}
.pokemon-card p {
  margin-top: 0.8rem;
  font-weight: 600;
  color: #1a237e;
  font-size: 1rem;
}

/* --- LOADING --- */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  color: #555;
}
.loader {
  width: 30px;
  height: 30px;
  border: 3px solid #90caf9;
  border-top: 3px solid #1e88e5;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin-bottom: 0.5rem;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
