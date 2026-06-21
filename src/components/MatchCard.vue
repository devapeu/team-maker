<template>
  <li class="match-card">
    <div class="match-card__info">
      <img
        :src="`/img/maps/${match.mapname}.webp`"
        class="match-card__map-image"/>
      <p class="match-card__map-name">{{ getMapName(match.mapname) }}</p>
      <p class="match-card__meta">{{ formatDate(match.startgametime) }}</p>
      <p class="match-card__meta">{{ formatDuration(match.duration) }}</p>
      <p v-if="eloDiff !== null" class="match-card__elo-diff">Sorpresa de {{ Math.round(eloDiff) }} Elo</p>
    </div>
    <div class="match-card__team">
      <p class="match-card__team-title">🏆 Ganadores</p>
      <ul class="player-list">
        <li v-for="p in winners" :key="p.profile_id" class="player-list__item">
          <img width="32" :src="`/img/gods/${p.god}_icon.avif`" />
          {{ p.name }}
          <span v-if="showElo" class="player-list__elo">{{ Math.round(p.elo) }}</span>
        </li>
      </ul>
    </div>
    <div class="match-card__team">
      <p class="match-card__team-title">&nbsp;</p>
      <ul class="player-list">
        <li v-for="p in losers" :key="p.profile_id" class="player-list__item">
          <img width="32" :src="`/img/gods/${p.god}_icon.avif`" />
          {{ p.name }}
          <span v-if="showElo" class="player-list__elo">{{ Math.round(p.elo) }}</span>
        </li>
      </ul>
    </div>
  </li>
</template>

<script setup>
import { getMapName } from '../data/maps';

defineProps({
  match: { type: Object, required: true },
  winners: { type: Array, default: () => [] },
  losers: { type: Array, default: () => [] },
  eloDiff: { type: Number, default: null },
  showElo: { type: Boolean, default: false },
});

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
</script>

<style lang="sass" scoped>
@use "../styles/abstracts/_variables" as *

.match-card
  display: grid
  grid-template-columns: 140px 1fr 1fr
  gap: 20px
  padding: 16px
  background: $background-light
  border: 1px solid #4d4841
  border-radius: 5px
  @media (max-width: 600px)
    grid-template-columns: 1fr
  &__map-name
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
  &__map-image
    width: 80px
    display: block
    margin-bottom: 4px
  &__meta
    color: #aaa
    font-size: 13px
  &__elo-diff
    display: inline-block
    margin-top: 6px
    padding: 2px 8px
    background: $gold-600
    color: $gold-950
    font-size: 12px
    font-weight: bold
    border-radius: 4px
  &__team-title
    display: flex
    justify-content: space-between
    align-items: center
    color: #aaa
    margin-bottom: 8px

.player-list
  background: #1c1b14
  padding: 8px
  border-radius: 4px
  list-style: none
  &__item
    display: flex
    align-items: center
    gap: 8px
    margin-bottom: 2px
  &__elo
    margin-left: auto
    font-family: $font-serif
    color: $gold-500
</style>
