<template>
  <div class="map-selector">
    <template v-if="hasDisplayedMap">
      <img class="map-selector__image" :src="mapIcon"/>
      <p>{{ mapName }}</p>
      <button class="map-button map-selector__button" @click="chooseMap">Otro mapa</button>
    </template>
    <template v-else>
      <button class="map-button first-map-button" @click="chooseMap">Mapa aleatorio</button>
    </template>
  </div>
</template>
<script setup>
import { MAPS_ARRAY } from '../data/maps.js'
import { ref, computed, watch } from 'vue'

const mapIcon = ref();
const mapName = ref();

const hasDisplayedMap = ref(false);

function getMapIcon(name) {
  return new URL(`../assets/maps/${name}.webp`, import.meta.url).href;
}

function chooseMap() {
  if (hasDisplayedMap.value === false) hasDisplayedMap.value = true;
  const map = MAPS_ARRAY[Math.floor(Math.random() * MAPS_ARRAY.length)];
  mapIcon.value =  getMapIcon(map.id);
  mapName.value = map.name;
}


</script>
<style lang="sass" scoped>

.map-selector
  margin-top: 10px
  display: flex
  align-items: center
  gap: 16px
  border: 1px solid #948772
  padding: 20px
  background: #161005
  border-radius: 5px
  &__image
    max-width: 84px
  &__button
    margin-left: auto
    padding: 4px 8px

.map-button
  border: 1px solid #948772
  border-radius: 5px
  color: #ddd
  background: linear-gradient(to bottom, #3A3121, #161005)
  box-shadow: inset 0 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 5px rgba(0, 0, 0, 0.5)
  transition: 150ms ease-out all
  cursor: pointer
  @media (pointer: fine)
    &:hover
      background: linear-gradient(to bottom, #5c4727, #0f0b03)
      box-shadow: inset 0 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 5px rgba(255, 191, 0, 0.25)
      color: #edb634
      border: 1px solid #d0a84b

.first-map-button
  margin: auto
  padding: 10px 20px
  font-size: 16px
  min-width: 140px
</style>