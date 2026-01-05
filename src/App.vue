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
                  matchup[team1Id]?.probability > 50 ? 'win-prob--green' : 'win-prob--red']"
                style="margin-right:8px;">
                {{ matchup[team1Id]?.probability.toFixed() }}%
              </span>
            </h2>
            <div
              class="teams__header-side"
              @mouseenter="winrateIsHovered = true"
              @mouseleave="winrateIsHovered = false">
              <p
                v-if="matchup !== null && !winrateIsHovered"
                class="teams__winrate">
                Wins: <span>{{ matchup[team1Id]?.wins }}</span>
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
                  matchup[team2Id]?.probability > 50 ? 'win-prob--green' : 'win-prob--red']"
                style="margin-right:8px;">
                {{ matchup[team2Id]?.probability.toFixed() }}%
              </span>
              {{ team2Label }}
            </h2>
            <div
              class="teams__header-side"
              @mouseenter="winrateIsHovered = true"
              @mouseleave="winrateIsHovered = false">
              <p
                v-if="matchup !== null && !winrateIsHovered"
                class="teams__winrate">
                Wins: <span>{{ matchup[team2Id]?.wins }}</span>
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
        <button class="teams__button" @click="sendPlannerToDiscord" title="Enviar a Discord">
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
import { computed } from 'vue'
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
  team1Id,
  team2Id,
  matchup,
  winrateIsHovered,
  autoBalanceTeams,
} = useTeams(autobalance)

// Wrapper functions for reset actions
const reset = () => resetPlayerData(team1, team2)
const resetAvailable = () => resetAvailablePlayerData(team1, team2)

// Player drawer
const { active, playerDetailsActive, openPlayerDetails } = usePlayerDrawer(playersMap)

// Discord integration
const { sendPlannerToDiscord } = useDiscord(team1, team2, showToast)

// Computed properties
const allPlayersPresent = computed(() => players.value.length === 0 && autobalance.value.length === 0)
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

.sm-button
  color: #ccc
  border: 1px solid #948772
  background: transparent
  font-size: 12px
  padding: 2px 6px
  border-radius: 4px
  cursor: pointer

.all-players
  margin-bottom: 16px
  .player
    opacity: 0.33

.draggable-label
  font-size: 16px
  opacity: 0.75
  font-weight: normal
  margin: 0

.teams__header-row
  display: flex
  align-items: center
  gap: 12px

.teams__controls
  display: flex
  gap: 12px
  justify-content: center
  margin-top: 14px

.teams__button
  margin: 0
  min-width: 140px
  position: relative
  justify-content: center
  gap: 0
  padding-left: 44px
  padding-right: 36px
  padding: 10px 20px
  cursor: pointer
  color: #ddd
  border: 1px solid #948772
  border-radius: 5px
  font-size: 16px
  background: linear-gradient(to bottom, #3A3121, #161005)
  box-shadow: inset 0 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 5px rgba(0, 0, 0, 0.5)
  transition: 150ms ease-out all
  display: inline-flex
  align-items: center
  gap: 8px
  @media (pointer: fine)
    &:hover
      background: linear-gradient(to bottom, #5c4727, #0f0b03)
      box-shadow: inset 0 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 5px rgba(255, 191, 0, 0.25)
      color: #edb634
      border: 1px solid #d0a84b

.teams__button__icon
  width: 24px
  height: 24px
  display: inline-flex
  align-items: center
  justify-content: center
  transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease
  color: white
  path
    fill: currentColor

  &.icon-discord
    background: #5865F2
    border-radius: 4px
    padding: 4px

.teams__button:hover .teams__button__icon
  transform: translateY(-2px)

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

.all-players-present
  text-align: center
  font-size: 28px
  text-transform: uppercase
  margin-bottom: 20px
  font-style: italic
  letter-spacing: 1px

// Toasts
.toast-container
  position: fixed
  top: 16px
  right: 16px
  display: flex
  flex-direction: column
  gap: 8px
  z-index: 9999

.toast
  min-width: 200px
  max-width: 320px
  color: #fff
  padding: 10px 14px
  border-radius: 8px
  box-shadow: 0 6px 18px rgba(0,0,0,0.32)
  font-size: 14px
  animation: toast-slide-in 240ms ease-out

.toast--success
  background: #28a745

.toast--error
  background: #e74c3c

@keyframes toast-slide-in
  from
    transform: translateX(120%)
    opacity: 0
  to
    transform: translateX(0)
    opacity: 1

.win-prob
  display: inline-block
  font-weight: bold
  padding: 0px 5px
  border-radius: 6px
  font-size: 15px
  margin-left: 8px
  &--green
    background: #28a745
    color: #fff
  &--red
    background: #e74c3c
    color: #fff
</style>
