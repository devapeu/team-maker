<template>
  <div class="picker">
    <h1 class="heading-1" style="display: none;">Team Selector</h1>
    
    <!-- Player List -->
    <div class="players">
      <h2 class="heading-2">Jugadores</h2>
      <draggable v-model="players" item-key="name" group="players" class="player-pool">
        <template #item="{ element, index }">
          <div class="player" :key="index">
            {{ element.name }} ({{ element.score }})
          </div>
        </template>
      </draggable>
    </div>
    
    <!-- Teams -->
    <div class="teams">
      <div class="teams__wrapper">
        <div class="teams__team">
          <h2 class="heading-2">Equipo 1</h2>
          <p style="margin: 0 0 8px">(Power Level: {{ team1Score }})</p>
          <draggable v-model="team1" item-key="name" group="players" class="team-box">
            <template #item="{ element }">
              <div class="player" :key="element.name">
                {{ element.name }} ({{ element.score }})
              </div>
            </template>
          </draggable>
        </div>
        
        <div class="teams__team">
          <h2 class="heading-2">Equipo 2</h2>
          <p style="margin: 0 0 8px">(Power Level: {{ team2Score }})</p>
          <draggable v-model="team2" item-key="name" group="players" class="team-box">
            <template #item="{ element }">
              <div class="player" :key="element.name">
                {{ element.name }} ({{ element.score }})
              </div>
            </template>
          </draggable>
        </div>
      </div>
      <div class="teams__controls">
        <button class="teams__button" @click="saveToLocalStorage">Guardar</button>
        <button class="teams__button" @click="reset">Reestablecer</button>
      </div>
    </div>
    
    <h2 class="heading-2">Combinaciones anteriores</h2>
    <ul class="saved-teams">
      <li 
        v-for="({ team1, team2 }, index) in savedTeams" 
        :key="index"
        class="saved-teams__pair">
        <ul class="saved-teams__team">
          <li class="saved-teams__player" v-for="player in team1" :key="player.name">{{ player.name }}</li>
        </ul>
        <div>vs.</div>
        <ul class="saved-teams__team">
          <li class="saved-teams__player" v-for="player in team2" :key="player.name">{{ player.name }}</li>
        </ul>
        <button class="saved-teams__button" @click="loadTeam({team1, team2})">Usar</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import draggable from "vuedraggable/dist/vuedraggable.common";

const PLAYERS_ARRAY = [
  { id: 1, name: 'Ayax', score: 100 },
  { id: 2, name: 'Diego', score: 90 },
  { id: 3, name: 'Piero', score: 90 },
  { id: 4, name: 'Jair', score: 70 },
  { id: 5, name: 'Jaume', score: 75 },
  { id: 6, name: 'Sebastian', score: 60 },
  { id: 7, name: 'Renato', score: 60 },
  { id: 8, name: 'Hector', score: 50 },
  { id: 9, name: 'Jardani', score: 55 },
  { id: 10, name: 'Christian', score: 50 },
]

// List of players with names and scores
const players = ref(PLAYERS_ARRAY)

// Teams for the drag and drop functionality
const team1 = ref([])
const team2 = ref([])
const likesTeams = ref(undefined)

// Computed properties for calculating team scores
const team1Score = computed(() => team1.value.reduce((sum, player) => sum + player.score, 0))
const team2Score = computed(() => team2.value.reduce((sum, player) => sum + player.score, 0))

// Hold previous team savedTeams
const savedTeams = ref([])

// Method to save current team configuration to localStorage
function saveToLocalStorage() {
  const localSavedTeams = JSON.parse(localStorage.getItem('saved-teams')) || []
  const currentTeamConfig = {
    team1: team1.value,
    team2: team2.value,
    likes: likesTeams.value
  }
  localStorage.setItem('saved-teams', JSON.stringify([...localSavedTeams, currentTeamConfig]))
  loadFromLocalStorage();
  alert('Configuration saved!')
}

// Method to load team configuration from localStorage
function loadFromLocalStorage() {
  const config = localStorage.getItem('saved-teams')
  if (config) {
    const parsedConfig = JSON.parse(config)
    savedTeams.value = parsedConfig || []
  } else {
    //alert('No configuration found!')
  }
}

function loadTeam(pair) {
  const slottedPlayersIds = [ ...pair.team1, ...pair.team2 ].map(({id}) => id);
  const availablePlayers = PLAYERS_ARRAY.filter(player => !slottedPlayersIds.includes(player.id));
  
  console.log({ slottedPlayersIds, availablePlayers, all: PLAYERS_ARRAY })
  team1.value = pair.team1;
  team2.value = pair.team2;
  players.value = availablePlayers;
}

function reset() {
  players.value = PLAYERS_ARRAY;
  team1.value = [];
  team2.value = [];
}

onMounted(() => {
  loadFromLocalStorage();
})
</script>

<style scoped>
.picker {
  text-align: center;
  max-width: 720px;
}

.heading-1 {
  font-size: 32px;
  margin: 0 0 12px;
}

.heading-2 {
  font-size: 24px;
  margin: 0 0 12px;
}

.players {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.player-pool {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 5px;
  background-color: #e8e8e8;
}

.teams {
  margin-bottom: 24px;
}

.teams__wrapper {
  display: flex;
  justify-content: center;
}

.teams__team {
  margin: 10px;
  padding: 10px;
  border: 2px solid #ccc;
  width: 200px;
}

.teams__controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.teams__button {
  padding: 10px 20px;
  cursor: pointer;
}

.team-box {
  padding: 5px;
  min-height: 200px;
  background-color: #e8e8e8;
}

.player {
  padding: 5px;
  background: white;
  border: 1px solid #ddd;
  margin: 5px;
  cursor: pointer;
}

.saved-teams {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background-color: #e8e8e8;
}

.saved-teams__pair {
  display: flex;
  align-items: center;
  background: white;
  list-style: none;
  padding: 8px;
  gap: 8px;
}

.saved-teams__team {
  display: flex;
  gap: 4px;
  list-style: none;
  padding: 0;
}

.saved-teams__player {
  background: #f0f0f0;
  border: 1px solid #e8e8e8;
  height: 24px;
  padding: 0 8px;
  line-height: 1;
  display: flex;
  align-items: center;
  border-radius: 4px;
}

.saved-teams__button {
  padding: 4px 8px;
  font-size: 12px;
  margin-left: auto;
}
</style>
