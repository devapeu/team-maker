<script setup>
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
  <div class="team-matchup">
    <div class="team-matchup__header">
      <div class="team-matchup__labels">
        <span>{{ team1.label }}</span>
        <span>{{ team2.label }}</span>
      </div>
      <div class="team-matchup__probability">
        <div 
          class="team-matchup__probability-item" 
          :style="{ 
            width: team1.probability + '%',
            backgroundColor: team1.probability > 50 ? '#10b981' : '#ef4444'
          }">
          {{ team1.probability }}%
        </div>
        <div 
          class="team-matchup__probability-item left" 
          :style="{ 
            width: team2.probability + '%',
            backgroundColor: team2.probability > 50 ? '#10b981' : '#ef4444'
          }">
          {{ team2.probability }}%
        </div>
      </div>
    </div>
    <div class="teams__wrapper" style="margin-bottom: 0!important" :class="thumbnail ? 'thumbnail' : ''">
      <div class="teams__team">
        <div class="teams__header">
          <div class="teams__score">{{ team1.score }}</div>
          <div class="teams__header-side">
            <div class="wins">{{ team1.wins }}</div>
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
          <div class="teams__score">{{ team2.score }}</div>
          <div class="teams__header-side">
            <div class="wins">{{ team2.wins }}</div>
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
  </div>
</template>

<style lang="sass" scoped>

.team-matchup
  &__header
    padding-top: 6px
    padding-left: 6px
    padding-right: 6px
  &__labels
    display: flex
    font-size: 10px
    justify-content: space-between
  &__probability
    width: 100%
    display: flex
    margin-top: 1px
    border-radius: 2px
    overflow: hidden
    &-item
      display: block
      background: red
      font-size: 4px
      padding-left: 2px
      &.left
        text-align: right
        padding-right: 2px

.wins
  background: #161005
  width: 16px
  height: 16px
  display: flex
  align-items: center
  justify-content: center
  border-radius: 2px
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
    display: flex
    gap: 4px
    height: 16px
  .teams__team
    width: 100%
    min-width: unset
    padding: 2px
    gap: 2px
  .teams__score
    font-size: 10px
  :deep(.player)
    height: 21px
    font-size: 8px
    min-width: unset
    margin: 1px
  :deep(.player)
    pointer-events: none
  :deep(.player__score)
    width: 21px
    font-size: 9px
  :deep(.player__name)
    padding: 6px 8px
    max-width: 75px
    min-width: 50px
    overflow: hidden
    text-overflow: ellipsis
  :deep(.player__icon)
    border-width: 3px
  .team-box
    min-height: 100px
</style>