<template>
  <div id="app">
    <!-- FIXED BACKGROUND -->
    <div class="background-layer" :style="backgroundStyle"></div>

    <!-- MAIN APP CONTENT -->
    <div class="app-wrapper">
      <Header v-if="!isHome" />

      <main class="container" :class="{ 'no-padding': isHome }">
        <router-view />
      </main>

      <Footer v-if="!isHome" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const isHome = computed(() => route.path === '/')

const backgroundStyle = ref({
  background: 'linear-gradient(180deg, #e3f2fd, #fff)',
})

const typeColors = {
  normal: 'linear-gradient(180deg, #bdb9b5, #e0d9d0, #f7f3ef)',
  fire: 'linear-gradient(180deg, #ff7043, #ffb74d, #ffe082)',
  water: 'linear-gradient(180deg, #42a5f5, #4fc3f7, #b3e5fc)',
  grass: 'linear-gradient(180deg, #66bb6a, #9ccc65, #c8e6c9)',
  electric: 'linear-gradient(180deg, #fdd835, #ffee58, #fff59d)',
  ice: 'linear-gradient(180deg, #4dd0e1, #81d4fa, #e1f5fe)',
  fighting: 'linear-gradient(180deg, #e53935, #ef5350, #ff867c)',
  poison: 'linear-gradient(180deg, #8e24aa, #ba68c8, #ce93d8)',
  ground: 'linear-gradient(180deg, #a1887f, #d7ccc8, #efebe9)',
  flying: 'linear-gradient(180deg, #64b5f6, #90caf9, #e3f2fd)',
  psychic: 'linear-gradient(180deg, #ec407a, #f48fb1, #f8bbd0)',
  bug: 'linear-gradient(180deg, #9ccc65, #aed581, #dce775)',
  rock: 'linear-gradient(180deg, #8d6e63, #a1887f, #d7ccc8)',
  ghost: 'linear-gradient(180deg, #5e35b1, #7e57c2, #b39ddb)',
  dragon: 'linear-gradient(180deg, #3949ab, #5c6bc0, #7986cb)',
  dark: 'linear-gradient(180deg, #212121, #424242, #757575)',
  steel: 'linear-gradient(180deg, #607d8b, #90a4ae, #cfd8dc)',
  fairy: 'linear-gradient(180deg, #f48fb1, #f8bbd0, #fce4ec)',

  rainbow: 'linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #5f27cd)',
  sunset: 'linear-gradient(180deg, #ff9966, #ff5e62)',
  ocean: 'linear-gradient(180deg, #2193b0, #6dd5ed)',
  forest: 'linear-gradient(180deg, #2e7d32, #81c784, #c8e6c9)',
  volcanic: 'linear-gradient(180deg, #d84315, #e64a19, #ff7043)',
  cosmic: 'linear-gradient(180deg, #311b92, #7e57c2, #ba68c8)',
}

function getDailyId() {
  const dateSeed = new Date().toISOString().split('T')[0]
  let seed = [...dateSeed].reduce((a, c) => a + c.charCodeAt(0), 0)
  return (seed % 898) + 1
}

async function setDailyBackground() {
  try {
    const id = getDailyId()
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    const p = await res.json()

    const image = p.sprites.other['official-artwork'].front_default
    const type = p.types?.[0]?.type?.name || 'normal'
    const gradient = typeColors[type] || typeColors.rainbow

    backgroundStyle.value = {
      background: `${gradient}, url(${image}) center/contain no-repeat`,
      backgroundAttachment: 'fixed',
      backgroundBlendMode: 'soft-light',
      backgroundSize: '40%',
      backgroundRepeat: 'no-repeat',
      transition: 'background 0.8s ease-in-out',
    }
  } catch (err) {
    console.error('Failed to set background:', err)
  }
}

onMounted(setDailyBackground)
</script>

<style>
.background-layer {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  transition: background 0.8s ease-in-out, filter 0.8s ease-in-out;
  filter: brightness(0.95) saturate(1.25);
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.container {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.container.no-padding {
  padding: 0;
  max-width: 100%;
}

.app-wrapper::before {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(3px);
  z-index: -1;
}

@keyframes bgFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.background-layer {
  animation: bgFade 1s ease-in-out;
}
</style>
