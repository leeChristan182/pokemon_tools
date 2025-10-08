<template>
  <router-link :to="`/pokemon/${pokemon.id}`" class="pokemon-card-link">
    <div class="pokemon-card">
      <img :src="pokemon.sprite" :alt="pokemon.name" />
      <p class="dex-number">#{{ pokemon.id }}</p>
      <h3 class="name">{{ pokemon.name }}</h3>
      <div class="types">
        <span v-for="type in pokemon.types" :key="type" class="type" :class="type">
          {{ type }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  pokemon: Object,
})
</script>

<style scoped>
.pokemon-card-link {
  text-decoration: none;
  color: inherit;
}

.pokemon-card {
  background: white;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s ease;
}
.pokemon-card:hover {
  transform: scale(1.08);
}

.dex-number {
  font-size: 12px;
  color: #6b7280;
}
.name {
  text-transform: capitalize;
  font-weight: bold;
  margin: 5px 0;
}

.types {
  display: flex;
  justify-content: center;
  gap: 5px;
}
.type {
  padding: 3px 8px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  text-transform: capitalize;
}

/* ✅ Type colors */
.type.grass {
  background: #78c850;
}
.type.fire {
  background: #f08030;
}
.type.water {
  background: #6890f0;
}
.type.electric {
  background: #f8d030;
  color: black;
}
.type.ice {
  background: #98d8d8;
  color: black;
}
.type.fighting {
  background: #c03028;
}
.type.poison {
  background: #a040a0;
}
.type.ground {
  background: #e0c068;
  color: black;
}
.type.flying {
  background: #a890f0;
}
.type.psychic {
  background: #f85888;
}
.type.bug {
  background: #a8b820;
}
.type.rock {
  background: #b8a038;
}
.type.ghost {
  background: #705898;
}
.type.dark {
  background: #705848;
}
.type.dragon {
  background: #7038f8;
}
.type.steel {
  background: #b8b8d0;
  color: black;
}
.type.fairy {
  background: #f0b6bc;
}
.type.normal {
  background: #a8a878;
}
</style>
