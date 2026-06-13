<template>
  <main class="stats">
    <h1>Stats</h1>
    <div class="stats-dashboard">
      <div class="stats-card">
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
              <th>Equipo 1</th>
              <th>Equipo 2</th>
              <th>Partidas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="matchup in matchups" :key="matchup.team_match_id">
              <td>{{ matchup.team1.join(', ') }}</td>
              <td>{{ matchup.team2.join(', ') }}</td>
              <td>{{ matchup.count }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No hay datos de enfrentamientos.</div>
      </div>

      <div class="stats-card stats-card--full">
        <h2>Mayores sorpresas</h2>
        <p class="stats-card__subtitle">Partidas en las que el equipo con menos Elo ganó.</p>
        <ul v-if="upsets.length" class="match-list">
          <li v-for="upset in upsets" :key="upset.match_id" class="match-card">
            <div class="match-card__info">
              <img
                :src="`/img/maps/${upset.mapname}.webp`"
                class="match-card__map-image"/>
              <p>{{ getMapName(upset.mapname) }}</p>
              <p class="match-card__meta">{{ formatDate(upset.startgametime) }}</p>
              <p class="match-card__meta">{{ formatDuration(upset.duration) }}</p>
              <p class="match-card__elo-diff">Sorpresa de {{ Math.round(upset.elo_diff) }} Elo</p>
            </div>
            <div class="match-card__team">
              <p class="match-card__team-title">
                Ganadores
                <span class="match-card__avg-elo">Elo {{ Math.round(upset.winner_avg_elo) }}</span>
              </p>
              <ul class="player-list">
                <li v-for="p in upset.winners" :key="p.profile_id" class="player-list__item">
                  <img width="32" :src="`/img/gods/${p.god}_icon.avif`" />
                  {{ p.name }} ✅
                  <span class="player-list__elo">{{ Math.round(p.elo) }}</span>
                </li>
              </ul>
            </div>
            <div class="match-card__team">
              <p class="match-card__team-title">
                Perdedores
                <span class="match-card__avg-elo">Elo {{ Math.round(upset.loser_avg_elo) }}</span>
              </p>
              <ul class="player-list">
                <li v-for="p in upset.losers" :key="p.profile_id" class="player-list__item">
                  <img width="32" :src="`/img/gods/${p.god}_icon.avif`" />
                  {{ p.name }} ❌
                  <span class="player-list__elo">{{ Math.round(p.elo) }}</span>
                </li>
              </ul>
            </div>
          </li>
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
          <li v-for="match in shortestMatches" :key="match.match_id" class="match-card">
            <div class="match-card__info">
              <img
                :src="`/img/maps/${match.mapname}.webp`"
                class="match-card__map-image"/>
              <p>{{ getMapName(match.mapname) }}</p>
              <p class="match-card__meta">{{ formatDate(match.startgametime) }}</p>
              <p class="match-card__meta">{{ formatDuration(match.duration) }}</p>
            </div>
            <div class="match-card__team">
              <p class="match-card__team-title">Ganadores</p>
              <ul class="player-list">
                <li v-for="p in match.winners" :key="p.profile_id" class="player-list__item">
                  <img width="32" :src="`/img/gods/${p.god}_icon.avif`" />
                  {{ p.name }} ✅
                </li>
              </ul>
            </div>
            <div class="match-card__team">
              <p class="match-card__team-title">Perdedores</p>
              <ul class="player-list">
                <li v-for="p in match.losers" :key="p.profile_id" class="player-list__item">
                  <img width="32" :src="`/img/gods/${p.god}_icon.avif`" />
                  {{ p.name }} ❌
                </li>
              </ul>
            </div>
          </li>
        </ul>
        <div v-else class="empty-state">No hay datos de duración.</div>
      </div>

      <div class="stats-card">
        <div class="stats-card__header">
          <h2>Partidas más largas</h2>
          <label class="toggle-control">
            <input type="checkbox" v-model="teamGamesOnly" />
            Solo partidas en equipo
          </label>
        </div>
        <ul v-if="longestMatches.length" class="match-list">
          <li v-for="match in longestMatches" :key="match.match_id" class="match-card">
            <div class="match-card__info">
              <img
                :src="`/img/maps/${match.mapname}.webp`"
                class="match-card__map-image"/>
              <p>{{ getMapName(match.mapname) }}</p>
              <p class="match-card__meta">{{ formatDate(match.startgametime) }}</p>
              <p class="match-card__meta">{{ formatDuration(match.duration) }}</p>
            </div>
            <div class="match-card__team">
              <p class="match-card__team-title">Ganadores</p>
              <ul class="player-list">
                <li v-for="p in match.winners" :key="p.profile_id" class="player-list__item">
                  <img width="32" :src="`/img/gods/${p.god}_icon.avif`" />
                  {{ p.name }} ✅
                </li>
              </ul>
            </div>
            <div class="match-card__team">
              <p class="match-card__team-title">Perdedores</p>
              <ul class="player-list">
                <li v-for="p in match.losers" :key="p.profile_id" class="player-list__item">
                  <img width="32" :src="`/img/gods/${p.god}_icon.avif`" />
                  {{ p.name }} ❌
                </li>
              </ul>
            </div>
          </li>
        </ul>
        <div v-else class="empty-state">No hay datos de duración.</div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { PLAYERS_ARRAY } from '../data/players';
import { getMapName } from '../data/maps';

const maps = ref([]);
const matchups = ref([]);
const upsets = ref([]);
const shortestMatches = ref([]);
const longestMatches = ref([]);
const teamGamesOnly = ref(false);

const PLAYERS_BY_ID = Object.fromEntries(PLAYERS_ARRAY.map(p => [p.profile_id, p]));

function getPlayerName(profileId) {
  return PLAYERS_BY_ID[profileId]?.name ?? profileId;
}

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
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upsets`);
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
  gap: 32px
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

.match-card
  display: grid
  grid-template-columns: 140px 1fr 1fr
  gap: 20px
  padding-bottom: 16px
  border-bottom: 1px solid #948772
  &:last-child
    border-bottom: none
    padding-bottom: 0
  @media (max-width: 600px)
    grid-template-columns: 1fr
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
    margin-bottom: 6px
  &__avg-elo
    font-family: $font-serif
    color: $gold-500

.player-list
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
