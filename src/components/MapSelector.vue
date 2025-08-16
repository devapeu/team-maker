<template>
  <div class="map-selector">
    <button @click="chooseMap">Mapa aleatorio</button>
    <img class="map-selector__image" :src="mapIcon"/>
    <p>{{ mapName }}</p>
  </div>
</template>
<script setup>
import { MAPS_ARRAY } from '../data/maps.js'
import { ref, computed, watch } from 'vue'

const mapIcon = ref();
const mapName = ref();

function getMapIcon(name) {
  return new URL(`../assets/maps/${name}.webp`, import.meta.url).href;
}

function chooseMap() {
  const map = MAPS_ARRAY[Math.floor(Math.random() * MAPS_ARRAY.length)];
  mapIcon.value =  getMapIcon(map.id);
  mapName.value = map.name;
}


</script>
<style lang="sass" scoped>

.map-selector
  margin-top: 10px
  display: flex
  flex-direction: column
  align-items: center
  &__image
    margin-top: 20px
    margin-bottom: 5px
    max-width: 256px

button
  margin: auto
  padding: 10px 20px
  cursor: pointer
  color: #ddd
  border: 1px solid #948772
  border-radius: 5px
  font-size: 16px
  background: linear-gradient(to bottom, #3A3121, #161005)
  box-shadow: inset 0 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 5px rgba(0, 0, 0, 0.5)
  transition: 150ms ease-out all
  @media (pointer: fine)
    &:hover
      background: linear-gradient(to bottom, #5c4727, #0f0b03)
      box-shadow: inset 0 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 5px rgba(255, 191, 0, 0.25)
      color: #edb634
      border: 1px solid #d0a84b
</style>