<template>
  <div id="app">
    <h1>Team Selector</h1>
    
    <!-- Player List -->
    <div class="player-list">
      <h2>Players</h2>
      <draggable v-model="players" item-key="name" group="players" class="player-pool">
        <template #item="{ element, index }">
          <div class="player" :key="index">
            {{ element.name }} ({{ element.score * 100 }})
          </div>
        </template>
      </draggable>
    </div>
    
    <!-- Teams -->
    <div class="teams">
      <div class="team">
        <h3>Team 1 (Score: {{ Math.round(team1Score * 10) / 10 }})</h3>
        <draggable v-model="team1" item-key="name" group="players" class="team-box">
          <template #item="{ element }">
            <div class="player" :key="element.name">
              {{ element.name }} ({{ element.score }})
            </div>
          </template>
        </draggable>
      </div>
      
      <div class="team">
        <h3>Team 2 (Score: {{  Math.round(team2Score * 10) / 10 }})</h3>
        <draggable v-model="team2" item-key="name" group="players" class="team-box">
          <template #item="{ element }">
            <div class="player" :key="element.name">
              {{ element.name }} ({{ element.score }})
            </div>
          </template>
        </draggable>
      </div>
    </div>
    <!-- Save and Load Configurations -->
    <button @click="saveConfiguration">Save Configuration</button>
    <button @click="loadConfiguration">Load Configuration</button>
    <button @click="reset">Reset</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import draggable from "vuedraggable/dist/vuedraggable.common";

const PLAYERS_ARRAY = [
  { id: 1, name: 'Ayax', score: 1 },
  { id: 2, name: 'Diego', score: 0.9 },
  { id: 3, name: 'Piero', score: 0.9 },
  { id: 4, name: 'Jair', score: 0.8 },
  { id: 5, name: 'Jaume', score: 0.8 },
  { id: 6, name: 'Sebastian', score: 0.75 },
  { id: 7, name: 'Renato', score: 0.75 },
  { id: 8, name: 'Hector', score: 0.7 },
  { id: 9, name: 'Jardani', score: 0.7 },
  { id: 10, name: 'Christian', score: 0.7 },
]

// List of players with names and scores
const players = ref(PLAYERS_ARRAY)

// Teams for the drag and drop functionality
const team1 = ref([])
const team2 = ref([])

// Computed properties for calculating team scores
const team1Score = computed(() => team1.value.reduce((sum, player) => sum + player.score, 0))
const team2Score = computed(() => team2.value.reduce((sum, player) => sum + player.score, 0))

// Method to save current team configuration to localStorage
function saveConfiguration() {
  const config = {
    team1: team1.value,
    team2: team2.value
  }
  localStorage.setItem('teamConfig', JSON.stringify(config))
  alert('Configuration saved!')
}

// Method to load team configuration from localStorage
function loadConfiguration() {
  const config = localStorage.getItem('teamConfig')
  if (config) {
    const parsedConfig = JSON.parse(config)
    team1.value = parsedConfig.team1 || []
    team2.value = parsedConfig.team2 || []
  } else {
    alert('No configuration found!')
  }
}

function reset() {
  players.value = PLAYERS_ARRAY;
  team1.value = [];
  team2.value = [];
}
</script>

<style scoped>
#app {
  text-align: center;
}

.player-list, .teams {
  display: flex;
  justify-content: center;
  margin: 10px;
}

.player-pool {
  display: flex;
  flex-wrap: wrap;
}

.team {
  margin: 10px;
  padding: 10px;
  border: 2px solid #ccc;
  width: 200px;
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

button {
  margin-top: 20px;
  padding: 10px 20px;
  cursor: pointer;
}
</style>
