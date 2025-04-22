<script setup>
import { computed } from 'vue';

function getGodIcon(name) {
  return new URL(`../assets/gods/${name}_icon.avif`, import.meta.url).href;
}

function displayProfile() {
  emit('displayProfile', props.player.id);
}

const props = defineProps({
  player: {
    type: Object,
    required: true
  },
});


</script>
<template>
  <div class="player">
    <img class="player__icon" :src="getGodIcon(player.main)" />
    <div class="player__name">{{ player.name }} </div>
    <span 
      class="player__score"
      @click="displayProfile">
      {{ player.score }}
    </span>
  </div>
</template>