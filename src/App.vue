<template>
  <header class="header">
    <div class="header__wrapper">
      <h1>Age of Mythology - Auto Balancer 3000</h1>
    </div>
  </header>
  
  <main class="team-builder">
    <!-- Player List -->
    <div class="players">
      <div class="all-players">
        <div class="section-header">
          <h2 class="draggable-label">
            Todos los jugadores
            <span v-if="isLoadingWinRates" class="loading-indicator">
              (Cargando win rates...)
            </span>
          </h2>
          <div class="header-buttons">
            <button @click="handleRefreshWinRates" :disabled="isLoadingWinRates">
              🔄 Win Rates
            </button>
            <button @click="handleReset">Reestablecer todos</button>
          </div>
        </div>
        <draggable v-model="players" item-key="name" group="players" class="player-pool">
          <template #item="{ element, index }">
            <PlayerBadge 
              :player="element" 
              @click-score="handleMoveToAvailable(element.id)"
              @click-profile="openPlayerDetails"/>
          </template>
        </draggable>
      </div>

      <div class="auto-balance">
        <h2 class="draggable-label">Jugadores disponibles</h2>
        <draggable v-model="autobalance" item-key="name" group="players" class="player-pool">
          <template #item="{ element, index }">
            <PlayerBadge 
              :player="element"
              @click-profile="openPlayerDetails" />
          </template>
        </draggable>
      </div>
    </div>
    
    <!-- Teams -->
    <div class="teams">
      <h2 class="draggable-label">Equipos</h2>
      <div class="teams__wrapper">
        <div class="teams__team">
          <div class="teams__header">
            <h2 class="teams__name">Equipo 1</h2>
            <p class="teams__score">{{ team1Score }}</p>
          </div>
          <draggable v-model="team1" item-key="name" group="players" class="team-box">
            <template #item="{ element }">
              <PlayerBadge 
                :player="element" 
                @click-profile="openPlayerDetails" />
            </template>
          </draggable>
        </div>
        
        <div class="teams__team">
          <div class="teams__header teams__header--inverse">
            <h2 class="teams__name">Equipo 2</h2>
            <p class="teams__score">{{ team2Score }}</p>
          </div>
          <draggable v-model="team2" item-key="name" group="players" class="team-box">
            <template #item="{ element }">
              <PlayerBadge 
                :player="element" 
                @click-profile="openPlayerDetails" />
            </template>
          </draggable>
        </div>
      </div>
      <div class="teams__controls">
        <button class="teams__button" @click="autoBalanceTeams">Auto Balance</button>
        <button class="teams__button" @click="resetAvailable">Reestablecer</button>
      </div>
    </div>
  </main>
  <n-drawer v-model:show="active" width="100%" placement="right">
    <n-drawer-content>
      <div class="player-info">
        <img 
          class="player-info__image" 
          :src="getGodIcon(playerDetailsActive.main)"
          :style="{ borderColor: playerDetailsActive.color }"/>
        <div class="player-info__details">
          <h2 class="player-info__name">
            {{ playerDetailsActive.name }}
          </h2>
          <div class="player-info__stats">
            <div class="stat-item">
              <span class="stat-label">Skill Score:</span>
              <span class="stat-value">{{ playerDetailsActive.score }}</span>
            </div>
            <div class="stat-item" v-if="playerDetailsActive.win_rate !== null && playerDetailsActive.win_rate !== undefined">
              <span class="stat-label">Win Rate:</span>
              <span class="stat-value">{{ playerDetailsActive.win_rate }}%</span>
            </div>
            <div class="stat-item" v-else>
              <span class="stat-label">Win Rate:</span>
              <span class="stat-value">Not available</span>
            </div>
          </div>
        </div>
      </div>

      <Radar
        id="my-chart-id"
        :options="chartOptions"
        :data="activePlayerData"
      />
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { onMounted } from 'vue'
import { chartOptions } from './data/chartOptions.js'
import draggable from "vuedraggable/dist/vuedraggable.common";
import PlayerBadge from './components/PlayerBadge.vue';
import { NDrawer, NDrawerContent } from "naive-ui"
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { Radar } from 'vue-chartjs'

// Composables
import { usePlayerData } from './composables/usePlayerData.js'
import { useTeamBalance } from './composables/useTeamBalance.js'
import { usePlayerProfile } from './composables/usePlayerProfile.js'
import { getGodIcon } from './utils/playerUtils.js'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

// Initialize composables
const {
  playersMap,
  players,
  isLoadingWinRates,
  initializePlayers,
  fetchPlayerWinRates,
  testWithMockWinRates
} = usePlayerData()

const {
  autobalance,
  team1,
  team2,
  team1Score,
  team2Score,
  autoBalanceTeams,
  reset,
  resetAvailable,
  moveToAvailable
} = useTeamBalance(playersMap)

const {
  active,
  playerDetailsActive,
  activePlayerData,
  openPlayerDetails
} = usePlayerProfile(playersMap)

// Initialize players on component mount
onMounted(async () => {
  initializePlayers();
  try {
    await fetchPlayerWinRates();
  } catch (error) {
    console.log('Netlify function not available in development, using mock data');
    testWithMockWinRates();
  }
})

// Wrapper functions for template
function handleReset() {
  reset(players)
}

function handleMoveToAvailable(id) {
  moveToAvailable(id, players)
}

// Handle win rate refresh
async function handleRefreshWinRates() {
  try {
    await fetchPlayerWinRates();
  } catch (error) {
    console.log('Using mock win rates for development');
    testWithMockWinRates();
  }
}
</script>

<style lang="sass" scoped>

.team-builder
  padding: 8px
  width: 100%
  max-width: 640px
  margin: 0 auto
  @media (min-width: 1024px)
    max-width: 1024px
    display: grid
    grid-template-columns: 1fr 1fr
    gap: 48px

.section-header
  display: flex
  justify-content: space-between
  align-items: flex-end
  margin-bottom: 4px
  
.header-buttons
  display: flex
  gap: 8px
  
.header-buttons button
  color: #ccc
  border: 1px solid #948772
  background: transparent
  font-size: 12px
  padding: 2px 6px
  border-radius: 4px
  cursor: pointer
  &:disabled
    opacity: 0.5
    cursor: not-allowed

.all-players
  margin-bottom: 16px
  .player
    opacity: 0.33

.draggable-label
  font-size: 16px
  opacity: 0.75
  font-weight: normal
  margin: 0
  
.loading-indicator
  font-size: 12px
  color: #4ade80
  font-style: italic

.auto-balance
  margin-bottom: 16px

.player-pool
  display: flex
  flex-wrap: wrap
  justify-content: center
  padding: 5px
  background-color: #161005
  min-height: 50px
  transition: 100ms ease-out all
  @media (pointer: fine)
    &:hover
      box-shadow: 0 0 5px rgba(241,194,50, 0.25) 

.player-info
  display: flex
  gap: 12px
  align-items: center
  padding-bottom: 12px
  margin-bottom: 16px
  border-bottom: 1px solid #948772
  &__image
    width: 48px
    border-left-style: solid
    border-left-width: 4px
  &__details
    flex: 1
  &__name
    margin-bottom: 8px
  &__stats
    display: flex
    flex-direction: column
    gap: 4px

.stat-item
  display: flex
  justify-content: space-between
  font-size: 14px
  
.stat-label
  color: #ccc
  
.stat-value
  color: #4ade80
  font-weight: bold
</style>
