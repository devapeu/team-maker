<script setup lang="ts">
import PlayerBadge from './PlayerBadge.vue';


const props = defineProps({
  team1: {
    type: Array,
    required: true
  },
  team2: {
    type: Array,
    required: true,
  },
});

</script>

<template>
  <div class="teams__wrapper" style="margin-bottom: 0!important">
    <div class="teams__team">
      <div class="teams__header">
        <div class="teams__name">Equipo 1</div>
        <div class="teams__header-side">
          {{ team1.score }}
        </div>
      </div>
      <div class="team-box">
        <PlayerBadge
          v-for="p in team1.players"
          :key="p.id" 
          :player="p" />
      </div>
    </div>
    <div class="teams__team">
      <div class="teams__header">
        <div class="teams__name">Equipo 2</div>
        <div class="teams__header-side">
          {{ team2.score }}
        </div>
      </div>
      <div class="team-box">
        <PlayerBadge
          v-for="p in team2.players"
          :key="p.id" 
          :player="p" />
      </div>
    </div>
  </div>
</template>