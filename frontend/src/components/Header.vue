<template>
  <header class="site-header">
    <!-- Brand -->
    <h1 class="brand">
      <router-link to="/">PokéTools</router-link>
    </h1>

    <!-- Navigation -->
    <nav class="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/pokedex">Pokedex</router-link>
      <router-link to="/itemdex">Itemdex</router-link>
      <router-link to="/games">GamesHub</router-link>
    </nav>
  </header>
</template>

<style scoped>
/* 🌈 Header layout */
.site-header {
  position: relative;
  top: 0;
  width: 100%;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 40px;
  backdrop-filter: blur(12px); /* ✅ Frosted glass effect */
  background: rgba(20, 20, 40, 0.4); /* ✅ transparent but colored */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

/* 🟡 Pokémon Brand (unchanged aesthetic) */
.brand {
  font-family: 'Pokemon Solid', sans-serif;
  font-size: 2rem;
  font-weight: 900;
  color: #ffcb05;
  text-shadow:
    -3px -3px 0 #2a75bb,
    3px -3px 0 #2a75bb,
    -3px 3px 0 #2a75bb,
    3px 3px 0 #2a75bb;
  margin: 0;
  letter-spacing: 4px;
}

.brand a {
  color: inherit;
  text-decoration: none;
  font: inherit;
  text-shadow: inherit;
  letter-spacing: inherit;
  display: inline-block;
  transition: transform 0.2s ease;
}

.brand a:hover {
  transform: scale(1.05);
}

/* 💼 Modern corporate nav */
.nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

/* ✅ Clean, professional nav links */
.nav a {
  position: relative;
  text-decoration: dotted;
  color: #000000;
  font-weight: bolder;
  font-size: 1rem;
  letter-spacing: 0.5px;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

/* Hover: subtle scale + gold accent line */
.nav a::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #ffcb05;
  transition: width 0.3s ease;
}

.nav a:hover {
  color: #ffcb05;
  transform: translateY(-1px);
}

.nav a:hover::after,
.nav a.router-link-active::after {
  width: 100%;
}

.nav a.router-link-active {
  color: #ffcb05;
}
</style>
