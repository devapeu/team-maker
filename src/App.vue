<template>
  <header class="header">
    <div class="header__wrapper">
      <h1>Age of Mythology - Auto Balancer 3000</h1>
    </div>
  </header>
  
  <main class="team-builder">
    <div>
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
      </div>
      <!-- Random Map Box -->
      <MapSelector />
    </div>
    <!-- Teams -->
    <div>
      <div class="teams">
        <div>
          <div class="teams__labels">
            <span>{{ team1Label }}</span>
            <span>{{ team2Label }}</span>
          </div>
          <div
            v-if="matchup !== null"
            class="teams__probability">
            <div 
              class="teams__probability-item" 
              :style="{ 
                width: (matchup && matchup[team1Key] ? matchup[team1Key].probability : 0) + '%',
                backgroundColor: (matchup && matchup[team1Key] && matchup[team1Key].probability > 50) ? '#246a4c' : '#763132'
              }">
              {{ (matchup && matchup[team1Key] ? matchup[team1Key].probability.toFixed() : 0) }}%
            </div>
            <div 
              class="teams__probability-item left" 
              :style="{ 
                width: (matchup && matchup[team2Key] ? matchup[team2Key].probability : 0) + '%',
                backgroundColor: (matchup && matchup[team2Key] && matchup[team2Key].probability > 50) ? '#246a4c' : '#763132'
              }">
              {{ (matchup && matchup[team2Key] ? matchup[team2Key].probability.toFixed() : 0) }}%
            </div>
          </div>
        </div>
        <div class="teams__wrapper">
          <div class="teams__team">
            <div class="teams__header">
              <h2 class="teams__score">{{ team1Score }}</h2>
              <div 
                class="teams__wins"
                :class="hasNoMatches ? 'teams__wins--no-matches' : ''">
                <template v-if="hasNoMatches">
                  -
                </template>
                <template v-else>
                  {{ matchup[team1Key]?.wins }}
                </template>
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
              <h2 class="teams__score">
                {{ team2Score }}
              </h2>
              <div 
                class="teams__wins"
                :class="hasNoMatches ? 'teams__wins--no-matches' : ''">
                <template v-if="hasNoMatches">
                  -
                </template>
                <template v-else>
                  {{ matchup[team2Key]?.wins }}
                </template>
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
          <button class="teams__button" @click="saveConfiguration">
            Guardar
          </button>
        </div>
      </div>
      <div>
        <div 
          v-if="Object.keys(savedConfigurations).length > 0"
          class="saved-configurations">
          <div class="saved-configurations__header">
            Opciones guardadas
            <button 
              class="saved-configurations__send-button"
              @click="handleSendToDiscord" title="Enviar a Discord">
              <DiscordIcon aria-hidden="true"/>
              Enviar a Discord
            </button>
          </div>
          <ul id="saved-configurations" class="saved-configurations__container">
            <li 
              v-for="(item, key, index) in savedConfigurations"
              :key="key"
              class="saved-configurations__item">
              <div class="saved-configurations__label">
                {{ index + 1 }}
              </div>
              <TeamMatchupScaffold 
                class="saved-configurations__team"
                :team1="item.team1"
                :team2="item.team2"
                thumbnail
                @click="removeConfiguration(key)" />
            </li>
          </ul>
        </div>
      </div>
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
import TeamMatchupScaffold from './components/TeamMatchupScaffold.vue';

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
  playersMap,
  averages,
  reset: resetPlayerData,
  moveToAvailable: moveToAvailableFunction
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
} = useTeams()

// Wrapper functions for reset actions
const reset = () => resetPlayerData(team1, team2)
const moveToAvailable = (id) => moveToAvailableFunction(id, team1, team2)

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

const savedConfigurations = ref({})

const removeConfiguration = (key) => {
  delete savedConfigurations.value[key];
}

const saveConfiguration = () => {
  if (team1.value.length === 0 || team2.value.length === 0) {
    showToast('Pon al menos un jugador en cada equipo.', 'error', 3000)
    return
  }

  const sortedTeams = [team1Key.value, team2Key.value].sort((a, b) => a.localeCompare(b))
  const teamMatchId = sortedTeams.join(" vs ");

  if (savedConfigurations.value[teamMatchId]) {
    showToast('Ya has guardado esa configuración.', 'error', 3000)
    return
  }

  if (Object.keys(savedConfigurations.value).length === 4) {
    showToast('Solo puedes preparar 4 configuraciones.', 'error', 3000)
    return
  }

  savedConfigurations.value[teamMatchId] = {
    team1: {
      label: team1Label.value,
      score: team1Score.value,
      players: [...team1.value],
      probability: matchup.value[team1Key.value]?.probability ?? 0,
      wins: matchup.value[team1Key.value]?.wins ?? 0,
    },
    team2: {
      label: team2Label.value,
      score: team2Score.value,
      players: [...team2.value],
      probability: matchup.value[team2Key.value]?.probability ?? 0,
      wins: matchup.value[team2Key.value]?.wins ?? 0,
    },
  };
}

// Computed properties
const allPlayersPresent = computed(() => players.value.length === 0)
const hasNoMatches = computed(() => {
  return matchup?.value === null || (matchup?.value[team1Key.value]?.wins === 0 && matchup?.value[team2Key.value]?.wins === 0)
})
</script>
