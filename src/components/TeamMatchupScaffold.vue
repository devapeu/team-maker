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
  thumbnail: {
    type: Boolean,
    required: false,
  }
});

</script>

<template>
  <div class="teams__wrapper" style="margin-bottom: 0!important" :class="thumbnail ? 'thumbnail' : ''">
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
      <div class="teams__header teams__header--inverse">
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

<style lang="sass" scoped>
.thumbnail
  &.teams__wrapper
    padding: 6px
    gap: 4px
    font-size: 9px
    width: auto
  .teams__header
    padding: 4px
  .teams__name
    font-size: 9px
  .teams__header-side
    height: 16px
  .teams__team
    width: 120px
    min-width: unset
    padding: 2px
    gap: 2px
  :deep(.player)
    height: 21px
    font-size: 8px
    min-width: 100px
    margin: 1px
  :deep(.player)
    pointer-events: none
  :deep(.player__score)
    width: 21px
    font-size: 9px
  :deep(.player__name)
    padding: 6px 8px
  :deep(.player__icon)
    border-width: 3px
  .team-box
    min-height: 100px
</style>