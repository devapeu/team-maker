<template>
  <main class="stats">
    <h1>Stats</h1>
    <div class="stats-dashboard">
      <div class="stats-card ">
        <h2>Mapas más jugados</h2>
        <table v-if="maps.length" class="player-table">
          <thead>
            <tr>
              <th>Mapa</th>
              <th>Partidas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="map in maps" :key="map.mapname">
              <td>
                <div class="cell-wrapper">
                  <img
                    :src="`/img/maps/${map.mapname}.webp`"
                    style="width: 50px"/>
                  {{ getMapName(map.mapname) }}
                </div>
              </td>
              <td>{{ map.count }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No hay datos de mapas.</div>
      </div>

      <div class="stats-card">
        <h2>Enfrentamientos más jugados</h2>
        <table v-if="matchups.length" class="player-table">
          <thead>
            <tr>
              <th style="text-align: right">Equipo 1</th>
              <th></th>
              <th>Equipo 2</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="matchup in matchups" :key="matchup.team_match_id">
              <td style="text-align: right">{{ matchup.team1.join(', ') }}</td>
              <td>{{ matchup.score[0] }} - {{ matchup.score[1] }}</td>
              <td>{{ matchup.team2.join(', ') }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No hay datos de enfrentamientos.</div>
      </div>

      <div class="stats-card">
        <div class="stats-card__header">
          <h2>Mayores sorpresas</h2>
          <select v-model="upsetsFilter" class="stats-select">
            <option value="2-weeks">Últimas 2 semanas</option>
            <option value="1-month">Último mes</option>
            <option value="2-month">Últimos 2 meses</option>
            <option value="6-month">Últimos 6 meses</option>
            <option value="all">Todo</option>
          </select>
        </div>
        <ul v-if="upsets.length" class="match-list">
          <MatchCard
            v-for="upset in upsets"
            :key="upset.match_id"
            :match="upset"
            :winners="upset.winners"
            :losers="upset.losers"
            :elo-diff="upset.elo_diff"
            show-elo/>
        </ul>
        <div v-else class="empty-state">No hay datos de sorpresas.</div>
      </div>

      <div class="stats-card">
        <div class="stats-card__header">
          <h2>Partidas más cortas</h2>
          <label class="toggle-control">
            <input type="checkbox" v-model="teamGamesOnly" />
            Solo partidas en equipo
          </label>
        </div>
        <ul v-if="shortestMatches.length" class="match-list">
          <MatchCard
            v-for="match in shortestMatches"
            :key="match.match_id"
            :match="match"
            :winners="match.winners"
            :losers="match.losers"/>
        </ul>
        <div v-else class="empty-state">No hay datos de duración.</div>

        <div class="stats-card__header">
          <h2>Partidas más largas</h2>
          <label class="toggle-control">
            <input type="checkbox" v-model="teamGamesOnly" />
            Solo partidas en equipo
          </label>
        </div>
        <ul v-if="longestMatches.length" class="match-list">
          <MatchCard
            v-for="match in longestMatches"
            :key="match.match_id"
            :match="match"
            :winners="match.winners"
            :losers="match.losers"/>
        </ul>
        <div v-else class="empty-state">No hay datos de duración.</div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { PLAYERS_ARRAY } from '../data/players';
import { getMapName } from '../data/maps';
import MatchCard from '../components/MatchCard.vue';

const maps = ref([]);
const matchups = ref([]);
const upsets = ref([]);
const shortestMatches = ref([]);
const longestMatches = ref([]);
const teamGamesOnly = ref(true);
const upsetsFilter = ref('all');

const upsetsAfter = computed(() => {
  const today = new Date();

  switch (upsetsFilter.value) {
    case '2-weeks':
      today.setDay(today.setDay() - 14);
      return Math.round(today.getTime() / 1000);
    case '1-month':
      today.setMonth(today.getMonth() - 1);
      return Math.round(today.getTime() / 1000);
    case '2-month':
      today.setMonth(today.getMonth() - 2);
      return Math.round(today.getTime() / 1000);
    case '6-month':
      today.setMonth(today.getMonth() - 6);
      return Math.round(today.getTime() / 1000);
    default:
      return 0;
  }
});

const PLAYERS_BY_ID = Object.fromEntries(PLAYERS_ARRAY.map(p => [p.profile_id, p]));

function getPlayerName(profileId) {
  return PLAYERS_BY_ID[profileId]?.name ?? profileId;
}

function splitByResult(players) {
  return {
    winners: players.filter(p => p.win === 1),
    losers: players.filter(p => p.win === 0),
  };
}

async function fetchMaps() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/maps`);
    const data = await res.json();
    maps.value = data.maps ?? [];
  } catch {
    maps.value = [];
  }
}

async function fetchMatchups() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/matchups`);
    const data = await res.json();
    matchups.value = (data.matchups ?? []).map(matchup => ({
      ...matchup,
      team1: matchup.team1.map(getPlayerName),
      team2: matchup.team2.map(getPlayerName),
    }));
  } catch {
    matchups.value = [];
  }
}

async function fetchUpsets() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upsets?after=${upsetsAfter.value}`);
    const data = await res.json();
    upsets.value = data.upsets ?? [];
  } catch {
    upsets.value = [];
  }
}

async function fetchMatchDuration() {
  try {
    const team_games_only = teamGamesOnly.value ? 'team_games_only' : '';
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/matches/duration?${team_games_only}`);
    const data = await res.json();
    shortestMatches.value = (data.shortest ?? []).map(match => ({ ...match, ...splitByResult(match.players) }));
    longestMatches.value = (data.longest ?? []).map(match => ({ ...match, ...splitByResult(match.players) }));
  } catch {
    shortestMatches.value = [];
    longestMatches.value = [];
  }
}

watch(teamGamesOnly, fetchMatchDuration);
watch(upsetsFilter, fetchUpsets);

onMounted(() => {
  fetchMaps();
  fetchMatchups();
  fetchUpsets();
  fetchMatchDuration();
})
</script>

<style lang="sass" scoped>
@use "../styles/abstracts/_variables" as *

.stats
  max-width: 1180px
  padding: 0 16px
  margin: auto

.stats-dashboard
  margin-top: 16px
  display: grid
  gap: 36px
  grid-template-columns: 1fr 1fr
  padding-bottom: 48px
  @media (max-width: 768px)
    gap: 24px
    grid-template-columns: 1fr

.stats-card
  h2
    margin-bottom: 8px
  &--full
    grid-column: 1 / -1
  &__subtitle
    font-style: italic
    opacity: 0.75
    margin-bottom: 12px
  &__header
    display: flex
    justify-content: space-between
    align-items: center
    gap: 12px
    margin-bottom: 10px
    h2
      margin-bottom: 0

.toggle-control
  display: flex
  align-items: center
  gap: 6px
  font-size: 13px
  color: #bbb
  cursor: pointer
  white-space: nowrap
  input
    cursor: pointer

.stats-select
  padding: 2px 10px
  background: $color-background
  color: white
  border: 1px solid #948772

.empty-state
  margin-top: 10px
  padding: 20px
  color: #aaa
  text-align: center
  border: 1px solid #948772

.match-list
  list-style: none
  display: flex
  flex-direction: column
  gap: 16px
  margin-bottom: 16px
</style>
