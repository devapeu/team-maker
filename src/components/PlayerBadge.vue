<script setup>
const emit = defineEmits(['click-profile', 'click-score']);

const props = defineProps({
  player: {
    type: Object,
    required: true
  },
});

function getGodIcon(name) {
  return new URL(`../assets/gods/${name}_icon.avif`, import.meta.url).href;
}

function clickProfile() {
  emit('click-profile', props.player.id);
}

function clickScore() {
  emit('click-score', props.player.id);
}

</script>
<template>
  <div class="player">
    <div 
      class="player__icon"
      tabindex="0"
      role="button"
      :style="{ borderLeftColor: player.color }"
      @click="clickProfile">
      <img 
        class="player__avatar" 
        :src="getGodIcon(player.main)"/>
    </div>
    <div class="player__name">{{ player.name }} </div>
    <span 
      class="player__score"
      tabindex="0"
      role="button"
      @click="clickScore">
      {{ player.score }}
    </span>
  </div>
</template>