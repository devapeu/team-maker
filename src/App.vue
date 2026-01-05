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
          <h2 class="draggable-label">Todos los jugadores</h2>
          <button class="sm-button" @click="reset">Reestablecer todos</button>
        </div>
        <draggable v-model="players" item-key="name" group="players" class="player-pool">
          <template #item="{ element, index }">
            <PlayerBadge 
              :player="element" 
              @click-score="moveToAvailable(element.id)"
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
      <div class="section-header">
        <h2 class="draggable-label">Equipos</h2>
        <button class="sm-button" @click="resetAvailable">Reestablecer</button>
      </div>
      <div class="teams__wrapper">
        <div class="teams__team">
          <div class="teams__header">
            <h2 class="teams__name">{{ team1Label }}
              <span 
                v-if="matchup !== null"
                :class="[
                  'win-prob', 
                  matchup[team1Key]?.probability > 50 ? 'win-prob--green' : 'win-prob--red']"
                style="margin-right:8px;">
                {{ matchup[team1Key]?.probability.toFixed() }}%
              </span>
            </h2>
            <div
              class="teams__header-side"
              @mouseenter="winrateIsHovered = true"
              @mouseleave="winrateIsHovered = false">
              <p
                v-if="showWins"
                class="teams__winrate">
                Wins: <span>{{ matchup[team1Key]?.wins }}</span>
              </p>
              <p
                v-else
                class="teams__score">
                {{ team1Score }}
              </p>
            </div>
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
            <h2 class="teams__name">
              <span 
                v-if="matchup !== null"
                :class="[
                  'win-prob', 
                  matchup[team2Key]?.probability > 50 ? 'win-prob--green' : 'win-prob--red']"
                style="margin-right:8px;">
                {{ matchup[team2Key]?.probability.toFixed() }}%
              </span>
              {{ team2Label }}
            </h2>
            <div
              class="teams__header-side"
              @mouseenter="winrateIsHovered = true"
              @mouseleave="winrateIsHovered = false">
              <p
                v-if="showWins"
                class="teams__winrate">
                Wins: <span>{{ matchup[team2Key]?.wins }}</span>
              </p>
              <p
                v-else
                class="teams__score">
                {{ team2Score }}
              </p>
            </div>
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
      <div 
        v-if="allPlayersPresent"
        class="all-players-present">
        gogogogogogogogo
      </div>
      <div class="teams__controls">
        <button class="teams__button" @click="autoBalanceTeams">
          <ShuffleIcon class="teams__button__icon" aria-hidden="true"/>
          Auto Balance
        </button>
        <button class="teams__button" @click="handleSendToDiscord" title="Enviar a Discord">
          <DiscordIcon class="teams__button__icon" aria-hidden="true"/>
          Enviar a Discord
        </button>
      </div>
      <MapSelector />
    </div>
  </main>
  <PlayerDrawer
    v-model:active="active"
    :playerDetailsActive="playerDetailsActive"
    :averages="averages" />
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
import { ref, computed } from 'vue'
import draggable from "vuedraggable/dist/vuedraggable.common";
import PlayerBadge from './components/PlayerBadge.vue';
import PlayerDrawer from './components/PlayerDrawer.vue';
import ShuffleIcon from './components/ShuffleIcon.vue'
import DiscordIcon from './components/DiscordIcon.vue'
import MapSelector from './components/MapSelector.vue';

// Composables
import { useToast } from './composables/useToast.js'
import { usePlayerData } from './composables/usePlayerData.js'
import { useTeams } from './composables/useTeams.js'
import { usePlayerDrawer } from './composables/usePlayerDrawer.js'
import { useDiscord } from './composables/useDiscord.js'

// Toast notifications
const { toasts, showToast } = useToast()

// Player data management
const {
  players,
  autobalance,
  playersMap,
  averages,
  reset: resetPlayerData,
  resetAvailable: resetAvailablePlayerData,
  moveToAvailable
} = usePlayerData()

// Teams management
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
  autoBalanceTeams,
} = useTeams(autobalance)

const winrateIsHovered = ref(false)
const showWins = computed(() => {
  if (!matchup.value || !team1Key.value || !team2Key.value) return false

  const team1Wins = matchup.value[team1Key.value]?.wins ?? 0
  const team2Wins = matchup.value[team2Key.value]?.wins ?? 0

  return !winrateIsHovered.value && (team1Wins > 0 || team2Wins > 0)
})

// Wrapper functions for reset actions
const reset = () => resetPlayerData(team1, team2)
const resetAvailable = () => resetAvailablePlayerData(team1, team2)

// Player drawer
const { active, playerDetailsActive, openPlayerDetails } = usePlayerDrawer(playersMap)

// Discord integration
const { sendPlannerToDiscord } = useDiscord(showToast)

const handleSendToDiscord = () => {
  if (team1.value.length === 0 || team2.value.length === 0) {
    showToast('Pon al menos un jugador en cada equipo.', 'error', 3000)
    return
  }

  sendPlannerToDiscord({
    team1Score: team1Score.value,
    team2Score: team2Score.value,
    matchup: matchup.value,
  });
}

// Computed properties
const allPlayersPresent = computed(() => players.value.length === 0 && autobalance.value.length === 0)
</script>
