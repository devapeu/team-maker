<template>
  <main class="matches">
    <h1>Partidas</h1>

    <div class="matches-layout">
      <section class="matches-results">
        <ul v-if="matches.length" class="match-list">
          <MatchCard
            v-for="match in matches"
            :key="match.match_id"
            :match="match"
            :winners="match.winners"
            :losers="match.losers"
            size="large"/>
        </ul>
        <div v-else-if="!loading" class="empty-state">No hay partidas.</div>

        <div class="matches-footer">
          <button v-if="hasMore" class="map-button" :disabled="loading" @click="loadMore">
            {{ loading ? 'Cargando...' : 'Cargar más' }}
          </button>
        </div>
      </section>

      <aside class="matches-filters">
        <h2>Filtros</h2>

        <label class="filter-control">
          Mapa
          <select v-model="mapFilter">
            <option value="">Todos</option>
            <option v-for="map in maps" :key="map.id" :value="map.id">{{ map.name }}</option>
          </select>
        </label>

        <label class="filter-control">
          Desde
          <input v-model="afterFilter" type="date" />
        </label>

        <label class="filter-control">
          Hasta
          <input v-model="beforeFilter" type="date" />
        </label>

        <label class="filter-control">
          Jugadores
          <NSelect
            v-model:value="playerFilter"
            multiple
            filterable
            clearable
            placeholder="Todos"
            :options="playerOptions"/>
        </label>

        <label v-if="playerFilter.length > 1" class="toggle-control">
          <input type="checkbox" v-model="playersMatchAll" />
          Deben estar todos en la misma partida
        </label>

        <label class="toggle-control">
          <input type="checkbox" v-model="teamGamesOnly" />
          Solo partidas en equipo
        </label>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { NSelect } from 'naive-ui';
import { getValidMaps } from '../data/maps';
import { PLAYERS_ARRAY } from '../data/players';
import MatchCard from '../components/MatchCard.vue';

const matches = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const mapFilter = ref('');
const afterFilter = ref('');
const beforeFilter = ref('');
const playerFilter = ref([]);
const playersMatchAll = ref(false);
const teamGamesOnly = ref(true);
const cursor = ref(null);

const maps = getValidMaps();
const PAGE_SIZE = 20;

const playerOptions = PLAYERS_ARRAY.map(p => ({ label: p.name, value: p.profile_id }));

function toTimestamp(dateStr) {
  return dateStr ? Math.floor(new Date(dateStr).getTime() / 1000) : null;
}

const afterTimestamp = computed(() => toTimestamp(afterFilter.value));
const beforeTimestamp = computed(() => toTimestamp(beforeFilter.value));

function splitByResult(players) {
  return {
    winners: players.filter(p => p.win === 1),
    losers: players.filter(p => p.win === 0),
  };
}

function buildQuery() {
  const params = new URLSearchParams();
  params.set('limit', PAGE_SIZE);
  if (cursor.value !== null) params.set('before', cursor.value);
  if (afterTimestamp.value !== null) params.set('after', afterTimestamp.value);
  if (teamGamesOnly.value) params.set('team_games_only', '1');
  if (mapFilter.value) params.set('map', mapFilter.value);
  if (playerFilter.value.length) {
    params.set('players', playerFilter.value.join(','));
    if (playerFilter.value.length > 1 && playersMatchAll.value) params.set('players_match_all', '1');
  }
  return params.toString();
}

async function fetchMatches({ reset = false } = {}) {
  loading.value = true;

  try {
    if (reset) cursor.value = beforeTimestamp.value;

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/matches?${buildQuery()}`);
    const data = await res.json();
    const page = (data.matches ?? []).map(match => ({ ...match, ...splitByResult(match.players) }));

    matches.value = reset ? page : [...matches.value, ...page];
    hasMore.value = page.length === PAGE_SIZE;
    if (page.length > 0) cursor.value = page.at(-1).startgametime;
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

watch([mapFilter, afterFilter, beforeFilter, playerFilter, playersMatchAll, teamGamesOnly], () => fetchMatches({ reset: true }));

onMounted(() => fetchMatches({ reset: true }));
</script>

<style lang="sass" scoped>
@use "../styles/abstracts/_variables" as *

.matches
  max-width: 1180px
  padding: 0 16px
  margin: auto

.matches-layout
  margin-top: 16px
  display: grid
  grid-template-columns: 1fr 280px
  gap: 24px
  align-items: start
  @media (max-width: 768px)
    grid-template-columns: 1fr

.matches-filters
  display: flex
  flex-direction: column
  gap: 16px
  padding: 16px
  background: $background-light
  border: 1px solid #4d4841
  border-radius: 5px
  @media (max-width: 768px)
    order: -1
  h2
    margin-bottom: 0
    font-size: 18px
    font-weight: 400

.filter-control
  display: flex
  flex-direction: column
  gap: 6px
  font-size: 13px
  color: #bbb
  select, input
    padding: 4px 10px
    background: $color-background
    color: white
    border: 1px solid #948772
    border-radius: 2px

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
