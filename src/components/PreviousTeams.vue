<template>
  <section>
    <h2 class="heading-2">Combinaciones anteriores</h2>
    <ul class="saved-teams">
      <li 
        v-for="({ id, team1, team2, likesTeams }, index) in savedTeams" 
        :key="index"
        class="saved-teams__pair">
        <div class="saved-teams__controls">
          <template v-if="likesTeams !== undefined">
            {{ likesTeams ? "😀" : "😡" }}
          </template>
          <template v-else>
            🫥
          </template>
          <div>
            <button class="saved-teams__button" @click="emit('delete', id)">Borrar</button>
            <button class="saved-teams__button" @click="emit('load', {id, team1, team2, likesTeams})">Usar</button>
          </div>
        </div>
        <div class="saved-teams__teams-wrapper">
          <ul class="saved-teams__team">
            <li class="saved-teams__player" v-for="player in team1" :key="player.name">{{ player.name }}</li>
          </ul>
          <div>vs.</div>
          <ul class="saved-teams__team">
            <li class="saved-teams__player" v-for="player in team2" :key="player.name">{{ player.name }}</li>
          </ul>
        </div>
      </li>
    </ul>
  </section>
</template>
<script setup>
import { defineEmits, defineProps } from 'vue'

const { savedTeams } = defineProps({
  savedTeams: {
    type: Array,
    required: true,
  }
})

const emit = defineEmits(['load', 'delete'])
</script>
<style lang="sass">
.saved-teams
  display: flex
  flex-direction: column
  gap: 8px
  padding: 12px
  background-color: #e8e8e8
  &__pair
    background: white
    list-style: none
    padding: 8px
  &__teams-wrapper
    display: flex
    align-items: center
    gap: 12px
    justify-content: center
  &__controls
    display: flex
    justify-content: space-between
    margin-bottom: 12px
  &__team
    display: flex
    flex-wrap: wrap
    justify-content: center
    gap: 4px
    list-style: none
    padding: 0
    flex: 1
    &:first-child
      justify-content: flex-end
    &:last-child
      justify-content: flex-start
  &__player
    background: #f0f0f0
    border: 1px solid #e8e8e8
    height: 24px
    padding: 0 8px
    line-height: 1
    display: flex
    align-items: center
    border-radius: 4px

  &__button
    padding: 4px 8px
    font-size: 12px
    margin-left: auto
</style>