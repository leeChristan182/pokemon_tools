// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import Pokedex from '@/components/Pokedex.vue'
import PokemonDetail from '@/components/PokemonDetail.vue'
import Itemdex from '@/components/Itemdex.vue'
import GamesHub from '@/components/GamesHub.vue' // ✅ new hub file

const routes = [
  { path: '/', component: Home },
  { path: '/pokedex', component: Pokedex },
  { path: '/pokemon/:id', component: PokemonDetail, props: true },
  { path: '/itemdex', component: Itemdex },
  { path: '/games', component: GamesHub }, // ✅ hub instead of BerryMemoryGame
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 } // ensures smooth reset when switching routes
  },
})
