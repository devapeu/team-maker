<template>
  <h1 class="heading-1" style="display: none;">Team Selector</h1>
  
  <!-- Player List -->
  <div class="players">
    <h2 class="heading-2">Jugadores</h2>
    <draggable v-model="players" item-key="name" group="players" class="player-pool">
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
          <p v-if="showScore" style="margin: 0">{{ team1Score }}</p>
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
          <p v-if="showScore" style="margin: 0">{{ team2Score }}</p>
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
    <OpinionBanner
      v-if="hasPlayersInTeams"
      :teamOpinion="likesTeams"
      @update="likesTeams = $event" />
    <label>
      <input v-model="showScore" type="checkbox"/>
      Mostrar puntajes
    </label>
    <div class="teams__controls">
      <button class="teams__button" @click="saveToLocalStorage">Guardar</button>
      <button class="teams__button" @click="reset">Reestablecer</button>
    </div>
  </div>
  
  <PreviousTeams 
    v-if="savedTeams.length"
    :savedTeams=savedTeams
    @load="loadTeam($event)"
    @delete="deleteTeam($event)"/>
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

  console.log(average)

  return {
    ...player,
    score: Math.round(average),
  }
})

const players = ref(playersMap)

// Teams for the drag and drop functionality
const id = ref(0)
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

function reset() {
  players.value = playersMap;
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
.heading-1
  font-size: 32px
  margin: 0 0 12px

.heading-2
  font-size: 24px
  margin: 0

.players
  display: flex
  flex-direction: column
  align-items: center
  margin-bottom: 24px

.player-pool
  display: flex
  flex-wrap: wrap
  justify-content: center
  padding: 5px
  background-color: #e8e8e8
  margin-top: 12px

.team-box
  padding: 4px
  min-height: 200px
  background-color: #0D0C0A
  @media (max-width: 425px)
    padding: 0
</style>
