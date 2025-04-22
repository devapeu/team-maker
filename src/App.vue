<template>
  <header class="header">
    <div class="header__wrapper">
      <h1>Age of Mythology - Auto Balancer 3000</h1>
    </div>
  </header>
  
  <main class="container">
    <!-- Player List -->
    <div class="players">
      <h2 class="draggable-label">Todos los jugadores</h2>
      <draggable v-model="players" item-key="name" group="players" class="player-pool">
        <template #item="{ element, index }">
          <PlayerBadge 
            :player="element"
            :showScore="showScore" />
        </template>
      </draggable>
    </div>

    <div class="auto-balance">
      <h2 class="draggable-label">Jugadores disponibles</h2>
      <draggable v-model="autobalance" item-key="name" group="players" class="player-pool">
        <template #item="{ element, index }">
          <PlayerBadge 
            :player="element"
            :showScore="showScore" />
        </template>
      </draggable>
    </div>
    
    <!-- Teams -->
    <div class="teams">
      <div class="teams__wrapper">
        <div class="teams__team">
          <div class="teams__header">
            <h2 class="teams__name">Equipo 1</h2>
            <p v-if="showScore" class="teams__score">{{ team1Score }}</p>
          </div>
          <draggable v-model="team1" item-key="name" group="players" class="team-box">
            <template #item="{ element }">
              <PlayerBadge 
                :player="element"
                :showScore="showScore" />
            </template>
          </draggable>
        </div>
        
        <div class="teams__team">
          <div class="teams__header teams__header--inverse">
            <h2 class="teams__name">Equipo 2</h2>
            <p v-if="showScore" class="teams__score">{{ team2Score }}</p>
          </div>
          <draggable v-model="team2" item-key="name" group="players" class="team-box">
            <template #item="{ element }">
              <PlayerBadge 
                :player="element"
                :showScore="showScore" />
            </template>
          </draggable>
        </div>
      </div>
      <div class="teams__controls">
        <button class="teams__button" @click="autoBalanceTeams">Auto Balance</button>
        <button class="teams__button" @click="saveToLocalStorage">Guardar</button>
        <button class="teams__button" @click="reset">Reestablecer</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { PLAYERS_ARRAY } from './data/players.js'
import draggable from "vuedraggable/dist/vuedraggable.common";
import OpinionBanner from './components/OpinionBanner.vue';
import PreviousTeams from './components/PreviousTeams.vue';
import PlayerBadge from './components/PlayerBadge.vue';

// List of players with names and scores
const playersMap = PLAYERS_ARRAY.map(player => {
  const values = Object.values(player.scores);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    ...player,
    score: Math.round(average),
  }
})

const players = ref(playersMap)

// Teams for the drag and drop functionality
const id = ref(0)
const autobalance = ref([])
const team1 = ref([])
const team2 = ref([])
const likesTeams = ref(undefined)

// Computed properties for calculating team scores
const team1Score = computed(() => team1.value.reduce((sum, player) => sum + player.score, 0))
const team2Score = computed(() => team2.value.reduce((sum, player) => sum + player.score, 0))
const hasPlayersInTeams = computed(() => {
  return team1.value.length && team2.value.length;
})

// Hold previous team savedTeams
const savedTeams = ref([])

// Interface settings
const showScore = ref(true);

// Method to save current team configuration to localStorage
function saveToLocalStorage() {
  const localSavedTeams = JSON.parse(localStorage.getItem('saved-teams')) || []
  if (!team1.value.length || !team2.value.length) return 

  const currentTeamConfig = {
    id: getPairId(team1.value, team2.value),
    team1: team1.value,
    team2: team2.value,
    likesTeams: likesTeams.value
  }
  
  const existingTeamIndex = localSavedTeams.findIndex(team => team.id === id.value);
  if (existingTeamIndex !== -1) {
    localSavedTeams.splice(existingTeamIndex, 1, currentTeamConfig)
  } else {
    localSavedTeams.push(currentTeamConfig)
  }

  localStorage.setItem('saved-teams', JSON.stringify(localSavedTeams))
  loadFromLocalStorage();
}

// Method to load team configuration from localStorage
function loadFromLocalStorage() {
  const config = localStorage.getItem('saved-teams')
  if (config) {
    const parsedConfig = JSON.parse(config)
    savedTeams.value = parsedConfig || []
  }
}

function loadTeam(saved) {
  const slottedPlayersIds = [ ...saved.team1, ...saved.team2 ].map(({id}) => id);
  const availablePlayers = playersMap.filter(player => !slottedPlayersIds.includes(player.id));  
  team1.value = saved.team1;
  team2.value = saved.team2;
  id.value = saved.id;
  likesTeams.value = saved.likesTeams;
  players.value = availablePlayers;
  window.scrollTo(0,0);
}

function deleteTeam(id) {
  if (confirm("Estas seguro que quieres borrar este equipo?")) {
    savedTeams.value = savedTeams.value.filter(team => team.id !== id);
    localStorage.setItem('saved-teams', JSON.stringify(savedTeams.value))
    loadFromLocalStorage();
  }
}

function autoBalanceTeams() {
  const playerPool = [...team1.value, ...team2.value, ...autobalance.value];
  const scores = playerPool.map(player => player.score);

  const combinations = [];
  const total = scores.length;
  const max = Math.pow(2, total);

  for (let i = 1; i < max - 1; i++) {
    const team1 = [];
    const team2 = [];
    let score1 = 0, score2 = 0;
    for (let j = 0; j < total; j++) {
      if ((i & (1 << j)) !== 0) {
        team1.push(playerPool[j]);
        score1 += playerPool[j].score;
      } else {
        team2.push(playerPool[j]);
        score2 += playerPool[j].score;

      }
    }

    if (Math.abs(team1.length - team2.length) <= 1) {
      combinations.push({
        team1: team1.sort((a, b) => b.score - a.score),
        team2: team2.sort((a, b) => b.score - a.score),
        difference: Math.abs(score1 - score2),
        score1, score2
      })
    }
  }

  combinations.sort((a, b) => a.difference - b.difference);
  const top3 = combinations.slice(0, 3);
  const randomTeam = top3[Math.floor(Math.random() * top3.length)];

  team1.value = randomTeam.team1;
  team2.value = randomTeam.team2;
  autobalance.value = [];

}

function reset() {
  players.value = playersMap;
  autobalance.value = [];
  team1.value = [];
  team2.value = [];
  likesTeams.value = undefined;
  id.value = 0; 
}

function getPairId(team1, team2) {
  const teams = 
    [team1.map(({id}) => id), team2.map(({id}) => id)]
    .map(innerArr => innerArr.slice().sort((a, b) => a - b))
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

  return JSON.stringify(teams)
}

watch([team1, team2], () => {
  id.value = getPairId(team1.value, team2.value);
})

onMounted(() => {
  loadFromLocalStorage();
})
</script>

<style lang="sass" scoped>

.header
  background: black
  width: 100%
  margin-bottom: 16px
  padding: 8px 12px
  border-bottom: 1px solid #948772
  box-shadow: 0 5px 10px rgba(241,194,50, 0.25) 
  &__wrapper
    max-width: 1024px
    width: 100%
    margin: 0 auto
  h1
    font-family: 'DM Serif Text', serif
    font-size: 18px
    color: #FFECA0
    margin: 0
    text-align: center
    text-shadow: 0 0 5px rgb(241,194,50) 

.heading-1
  font-size: 32px
  margin: 0 0 12px

.heading-2
  font-size: 24px
  margin: 0

.players
  margin-bottom: 16px
  .player
    opacity: 0.5

.draggable-label
  font-size: 14px
  opacity: 0.75
  font-weight: normal
  margin: 0
  margin-bottom: 4px

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
  &:hover
    box-shadow: 0 0 5px rgba(241,194,50, 0.25) 
</style>
