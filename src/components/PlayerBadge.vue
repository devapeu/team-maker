<script setup>
import { computed, defineProps } from 'vue';

function getGodIcon(name) {
  return new URL(`../assets/gods/${name}_icon.avif`, import.meta.url).href;
}

function displayProfile() {
  console.log(JSON.stringify(props.player.scores));
}

const props = defineProps({
  player: {
    type: Object,
    required: true
  },
  showScore: {
    type: Boolean,
    default: false
  }
});


</script>
<template>
  <div class="drag-wrapper">
    <div class="player">
      <img class="player__icon" :src="getGodIcon(player.main)" />
      <div class="player__name">{{ player.name }} </div>
      <span 
        v-if="showScore"
        class="player__score"
        @click="displayProfile">
        {{ player.score }}
      </span>
    </div>
  </div>
</template>