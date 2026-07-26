<template>
  <header class="header">
    <div class="header__wrapper">
      <div class="header__brand">
        <router-link to="/" class="header__logo-link">
          <img src="/logo.png" alt="GG Army" class="header__logo" />
        </router-link>
      </div>
      <nav class="header__nav">
        <router-link to="/matches">Partidas</router-link>
        <router-link to="/stats">Estadísticas</router-link>
      </nav>
    </div>
  </header>
  <router-view />
</template>

<script setup>
</script>
