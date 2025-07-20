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
    <img 
      class="player__icon" 
      :src="getGodIcon(player.main)"
      :style="{ borderLeftColor: player.color }"
      @click="clickProfile"/>
    <div class="player__name">{{ player.name }}</div>
    <div class="player__stats">
      <span 
        class="player__score"
        @click="clickScore"
        :title="player.win_rate !== null ? `Combined Score (Skill + Win Rate)` : 'Skill-based Score'">
        {{ player.score }}
      </span>
      <span 
        v-if="player.win_rate !== null && player.win_rate !== undefined"
        class="player__winrate"
        :title="`Win Rate from aomstats`">
        {{ player.win_rate }}%
      </span>
    </div>
  </div>
</template>