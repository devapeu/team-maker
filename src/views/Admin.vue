<template>
  <main class="admin">
    <div class="admin__header">
      <h1>Añadir partida</h1>
      <button class="sm-button" @click="handleLogout">Cerrar sesión</button>
    </div>

    <div class="admin-layout">
      <section class="admin-main">
        <div class="match-details">
          <label class="filter-control">
            Mapa
            <select v-model="mapname">
              <option value="" disabled>Selecciona un mapa</option>
              <option v-for="map in maps" :key="map.id" :value="map.id">{{ map.name }}</option>
            </select>
          </label>
          <label class="filter-control">
            Fecha y hora
            <input v-model="startDatetime" type="datetime-local" />
          </label>
          <label class="filter-control">
            Duración (minutos)
            <input v-model.number="durationMinutes" type="number" min="8" />
          </label>
        </div>

        <div class="players">
          <div class="all-players">
            <div class="section-header">
              <h2 class="draggable-label">Todos los jugadores</h2>
              <button class="sm-button" @click="reset">Reestablecer todos</button>
            </div>
            <draggable v-model="players" item-key="name" group="players" class="player-pool">
              <template #item="{ element }">
                <PlayerBadge
                  :player="element"
                  @click-score="moveToAvailable(element.id)"
                  @change-god="handleGodChange"
                  @click-profile="openPlayerDetails" />
              </template>
            </draggable>
          </div>
        </div>

        <div class="teams">
          <div>
            <div class="teams__labels">
              <span>{{ team1Label }}</span>
              <span>{{ team2Label }}</span>
            </div>
            <div
              v-if="matchup !== null"
              class="teams__probability"
              @click="openHistoryDrawer">
              <div
                class="teams__probability-item"
                :style="{
                  width: (matchup && matchup[team1Key] ? matchup[team1Key].probability : 0) + '%',
                  backgroundColor: (matchup && matchup[team1Key] && matchup[team1Key].probability > 50) ? '#246a4c' : '#333'
                }">
                {{ (matchup && matchup[team1Key] ? matchup[team1Key].probability.toFixed() : 0) }}%
              </div>
              <div
                class="teams__probability-item left"
                :style="{
                  width: (matchup && matchup[team2Key] ? matchup[team2Key].probability : 0) + '%',
                  backgroundColor: (matchup && matchup[team2Key] && matchup[team2Key].probability > 50) ? '#246a4c' : '#333'
                }">
                {{ (matchup && matchup[team2Key] ? matchup[team2Key].probability.toFixed() : 0) }}%
              </div>
            </div>
          </div>
          <div class="teams__wrapper">
            <div class="teams__team" :class="{ 'teams__team--winner': winner === 1 }">
              <div class="teams__header">
                <h2 class="teams__score">{{ team1Score }}</h2>
                <button class="sm-button" @click="winner = 1">
                  {{ winner === 1 ? '🏆 Ganador' : 'Marcar como ganador' }}
                </button>
              </div>
              <draggable v-model="team1" item-key="name" group="players" class="team-box">
                <template #item="{ element }">
                  <PlayerBadge
                    :player="element"
                    @change-god="handleGodChange"
                    @click-profile="openPlayerDetails" />
                </template>
              </draggable>
            </div>

            <div class="teams__team" :class="{ 'teams__team--winner': winner === 2 }">
              <div class="teams__header teams__header--inverse">
                <h2 class="teams__score">{{ team2Score }}</h2>
                <button class="sm-button" @click="winner = 2">
                  {{ winner === 2 ? '🏆 Ganador' : 'Marcar como ganador' }}
                </button>
              </div>
              <draggable v-model="team2" item-key="name" group="players" class="team-box">
                <template #item="{ element }">
                  <PlayerBadge
                    :player="element"
                    @change-god="handleGodChange"
                    @click-profile="openPlayerDetails" />
                </template>
              </draggable>
            </div>
          </div>
          <div class="teams__controls">
            <button class="teams__button" @click="autoBalanceTeams">
              <ShuffleIcon class="teams__button__icon" aria-hidden="true"/>
              Auto Balance
            </button>
            <button class="teams__button" :disabled="saving" @click="handleSave">
              {{ saving ? 'Guardando...' : 'Guardar partida' }}
            </button>
          </div>
        </div>
      </section>

      <aside class="admin-latest">
        <h2>Últimas partidas</h2>
        <ul v-if="latestMatches.length" class="match-list">
          <MatchCard
            v-for="match in latestMatches"
            :key="match.match_id"
            :match="match"
            :winners="match.winners"
            :losers="match.losers" />
        </ul>
        <div v-else class="empty-state">No hay partidas.</div>
      </aside>
    </div>
  </main>
  <PlayerDrawer
    v-model:active="active"
    :playerDetailsActive="playerDetailsActive"
    :averages="averages" />
  <HistoryDrawer
    v-model:active="historyDrawerActive"
    :history="history" />
  <div class="toast-container" aria-live="polite">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast"
      :class="`toast--${t.type}`">
      {{ t.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import draggable from "vuedraggable/dist/vuedraggable.common";
import { useRouter } from 'vue-router'
import PlayerBadge from '../components/PlayerBadge.vue';
import PlayerDrawer from '../components/PlayerDrawer.vue';
import HistoryDrawer from '../components/HistoryDrawer.vue';
import ShuffleIcon from '../components/ShuffleIcon.vue'
import MatchCard from '../components/MatchCard.vue';
import { getValidMaps } from '../data/maps.js'

import { useToast } from '../composables/useToast.js'
import { usePlayerData } from '../composables/usePlayerData.js'
import { useTeams } from '../composables/useTeams.js'
import { usePlayerDrawer } from '../composables/usePlayerDrawer.js'
import { useAdminAuth } from '../composables/useAdminAuth.js'
import { syncGodChange } from '../composables/usePlayerGodSync.js'
import { fetchPlayerElos } from '../composables/usePlayerElo.js'
import { ALL_GODS } from '../data/gods.js'

const router = useRouter()
const { logout, getToken } = useAdminAuth()
const { toasts, showToast } = useToast()

const maps = getValidMaps();

const {
  players,
  playersMap,
  averages,
  reset: resetPlayerData,
  moveToAvailable: moveToAvailableFunction
} = usePlayerData()

const {
  team1,
  team2,
  team1Label,
  team2Label,
  team1Score,
  team2Score,
  team1Key,
  team2Key,
  matchup,
  autoBalanceTeams
} = useTeams()

const reset = () => resetPlayerData(team1, team2)
const moveToAvailable = (id) => moveToAvailableFunction(id, team1, team2)
const handleGodChange = (data) => syncGodChange([players, team1, team2], data)

const { active, playerDetailsActive, openPlayerDetails } = usePlayerDrawer(playersMap)

const historyDrawerActive = ref(false)
const history = ref(null);

function openHistoryDrawer() {
  historyDrawerActive.value = true;
  history.value = matchup?.value.history;
}

function handleLogout() {
  logout()
  router.push({ name: 'Login' })
}

// Match details
const mapname = ref('')
const startDatetime = ref(toDatetimeLocal(new Date()))
const durationMinutes = ref(10)
const winner = ref(null)
const saving = ref(false)

function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function splitByResult(players) {
  return {
    winners: players.filter(p => p.win === 1),
    losers: players.filter(p => p.win === 0),
  };
}

const latestMatches = ref([])

async function fetchLatestMatches() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/matches?limit=10&team_games_only=1`);
    const data = await res.json();
    latestMatches.value = (data.matches ?? []).map(match => ({ ...match, ...splitByResult(match.players) }));
  } catch {
    latestMatches.value = [];
  }
}

async function handleSave() {
  if (team1.value.length === 0 || team2.value.length === 0) {
    showToast('Pon al menos un jugador en cada equipo.', 'error', 3000)
    return
  }

  if (!mapname.value) {
    showToast('Selecciona un mapa.', 'error', 3000)
    return
  }

  if (winner.value !== 1 && winner.value !== 2) {
    showToast('Indica qué equipo ganó.', 'error', 3000)
    return
  }

  if (!durationMinutes.value || durationMinutes.value < 8) {
    showToast('La duración debe ser de al menos 8 minutos.', 'error', 3000)
    return
  }

  saving.value = true

  try {
    const payload = {
      mapname: mapname.value,
      startgametime: Math.floor(new Date(startDatetime.value).getTime() / 1000),
      duration: durationMinutes.value * 60,
      winner: winner.value,
      team1: team1.value.map(p => ({ profile_id: p.profile_id, name: p.name, god: p.god })),
      team2: team2.value.map(p => ({ profile_id: p.profile_id, name: p.name, god: p.god })),
    }

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': getToken() },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'No se pudo guardar la partida')
    }

    showToast('Partida guardada correctamente.', 'success', 3000)
    reset()
    winner.value = null
    await fetchLatestMatches()
  } catch (err) {
    showToast(err.message || 'Error al guardar la partida', 'error', 4000)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await fetchPlayerElos(players)
  players.value.forEach(p => {
    if (!p.eloData) p.eloData = {}
    p.eloData.gods = ALL_GODS
  })
  fetchLatestMatches()
})
</script>

<style lang="sass" scoped>
@use "../styles/abstracts/_variables" as *

.admin
  padding: 0 16px
  margin: auto
  &__header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 16px

.admin-layout
  display: grid
  grid-template-columns: 2fr 1fr
  gap: 24px
  align-items: start
  @media (max-width: 900px)
    grid-template-columns: 1fr

.admin-main
  display: flex
  flex-direction: column
  gap: 24px

.admin-latest
  display: flex
  flex-direction: column
  gap: 12px
  h2
    margin: 0
    font-size: 18px
    font-weight: 400

.match-details
  display: flex
  flex-wrap: wrap
  gap: 16px
  padding: 16px
  background: $background-light
  border: 1px solid #4d4841
  border-radius: 5px

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

.teams__team--winner
  border-color: $gold-500
  box-shadow: 0 0 8px rgba(255, 197, 63, 0.4)

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
  gap: 12px
</style>
