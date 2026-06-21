<template>
  <main class="matches">
    <h1>Partidas</h1>

    <div class="matches-filters">
      <label class="filter-control">
        Mapa
        <select v-model="mapFilter">
          <option value="">Todos</option>
          <option v-for="map in maps" :key="map.id" :value="map.id">{{ map.name }}</option>
        </select>
      </label>

      <label class="filter-control">
        Dios
        <input v-model.trim="godFilter" type="text" placeholder="ej. zeus" />
      </label>

      <label class="toggle-control">
        <input type="checkbox" v-model="teamGamesOnly" />
        Solo partidas en equipo
      </label>
    </div>

    <ul v-if="matches.length" class="match-list">
      <li v-for="match in matches" :key="match.match_id" class="match-card">
        <div class="match-card__info">
          <img
            :src="`/img/maps/${match.mapname}.webp`"
            class="match-card__map-image"/>
          <p class="match-card__map-name">{{ getMapName(match.mapname) }}</p>
          <p class="match-card__meta">{{ formatDate(match.startgametime) }}</p>
          <p class="match-card__meta">{{ formatDuration(match.duration) }}</p>
        </div>
        <div class="match-card__team">
          <p class="match-card__team-title">🏆 Ganadores</p>
          <ul class="player-list">
            <li v-for="p in match.winners" :key="p.profile_id" class="player-list__item">
              <img width="32" :src="`/img/gods/${p.god}_icon.avif`" />
              {{ p.name }}
            </li>
          </ul>
        </div>
        <div class="match-card__team">
          <p class="match-card__team-title">&nbsp;</p>
          <ul class="player-list">
            <li v-for="p in match.losers" :key="p.profile_id" class="player-list__item">
              <img width="32" :src="`/img/gods/${p.god}_icon.avif`" />
              {{ p.name }}
            </li>
          </ul>
        </div>
      </li>
    </ul>
    <div v-else-if="!loading" class="empty-state">No hay partidas.</div>

    <div class="matches-footer">
      <button v-if="hasMore" class="map-button" :disabled="loading" @click="loadMore">
        {{ loading ? 'Cargando...' : 'Cargar más' }}
      </button>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { getMapName, getValidMaps } from '../data/maps';

const matches = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const mapFilter = ref('');
const godFilter = ref('');
const teamGamesOnly = ref(false);

const maps = getValidMaps();
const PAGE_SIZE = 20;

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

function splitByResult(players) {
  return {
    winners: players.filter(p => p.win === 1),
    losers: players.filter(p => p.win === 0),
  };
}

function buildQuery(before) {
  const params = new URLSearchParams();
  params.set('limit', PAGE_SIZE);
  if (before) params.set('before', before);
  if (teamGamesOnly.value) params.set('team_games_only', '1');
  if (mapFilter.value) params.set('map', mapFilter.value);
  if (godFilter.value) params.set('god', godFilter.value);
  return params.toString();
}

async function fetchMatches({ reset = false } = {}) {
  loading.value = true;

  try {
    const before = reset ? null : matches.value.at(-1)?.startgametime;
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/matches?${buildQuery(before)}`);
    const data = await res.json();
    const page = (data.matches ?? []).map(match => ({ ...match, ...splitByResult(match.players) }));

    matches.value = reset ? page : [...matches.value, ...page];
    hasMore.value = page.length === PAGE_SIZE;
  } catch {
    if (reset) matches.value = [];
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  fetchMatches();
}

watch([mapFilter, godFilter, teamGamesOnly], () => fetchMatches({ reset: true }));

onMounted(() => fetchMatches({ reset: true }));
</script>

<style lang="sass" scoped>
@use "../styles/abstracts/_variables" as *

.matches
  max-width: 720px
  padding: 0 16px
  margin: auto

.matches-filters
  display: flex
  flex-wrap: wrap
  align-items: center
  gap: 20px
  margin: 16px 0

.filter-control
  display: flex
  align-items: center
  gap: 6px
  font-size: 13px
  color: #bbb
  select, input
    padding: 2px 10px
    background: $color-background
    color: white
    border: 1px solid #948772

.toggle-control
  display: flex
  align-items: center
  gap: 6px
  font-size: 13px
  color: #bbb
  cursor: pointer
  input
    cursor: pointer

.empty-state
  margin-top: 10px
  padding: 20px
  color: #aaa
  text-align: center
  border: 1px solid #948772

.matches-footer
  display: flex
  justify-content: center
  margin: 24px 0 48px

.match-list
  list-style: none
  display: flex
  flex-direction: column
  gap: 16px
  padding-bottom: 16px

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

.map-button
  border: 1px solid #948772
  border-radius: 5px
  color: #ddd
  background: linear-gradient(to bottom, #3A3121, #161005)
  box-shadow: inset 0 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 5px rgba(0, 0, 0, 0.5)
  transition: 150ms ease-out all
  cursor: pointer
  font-family: "DM Sans"
  padding: 8px 24px
  &:disabled
    opacity: 0.5
    cursor: default
  @media (pointer: fine)
    &:hover:not(:disabled)
      background: linear-gradient(to bottom, #5c4727, #0f0b03)
</style>
