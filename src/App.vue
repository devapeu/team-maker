<template>
  <h1 class="heading-1" style="display: none;">Team Selector</h1>
  
  <!-- Player List -->
  <div class="players">
    <h2 class="heading-2">Jugadores</h2>
    <draggable v-model="players" item-key="name" group="players" class="player-pool">
      <template #item="{ element, index }">
        <div class="player" :key="index">
          {{ element.name }} 
          <span v-if="showScore">
            ({{ element.score }})
          </span>
        </div>
      </template>
    </draggable>
  </div>
  
  <!-- Teams -->
  <div class="teams">
    <div class="teams__wrapper">
      <div class="teams__team">
        <div>
          <h2 class="heading-2">Equipo 1</h2>
          <p v-if="showScore" style="margin: 0">(Power Level: {{ team1Score }})</p>
        </div>
        <draggable v-model="team1" item-key="name" group="players" class="team-box">
          <template #item="{ element }">
            <div class="player" :key="element.name">
              {{ element.name }} 
              <span v-if="showScore">
                ({{ element.score }})
              </span>
            </div>
          </template>
        </draggable>
      </div>
      
      <div class="teams__team">
        <div>
          <h2 class="heading-2">Equipo 2</h2>
          <p v-if="showScore" style="margin: 0">(Power Level: {{ team2Score }})</p>
        </div>
        <draggable v-model="team2" item-key="name" group="players" class="team-box">
          <template #item="{ element }">
            <div class="player" :key="element.name">
              {{ element.name }} 
              <span v-if="showScore">
                ({{ element.score }})
              </span>
            </div>
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
import { ref, computed, onMounted } from 'vue'
import draggable from "vuedraggable/dist/vuedraggable.common";
import OpinionBanner from './components/OpinionBanner.vue';
import PreviousTeams from './components/PreviousTeams.vue';

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
    id: Date.now(),
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
  const availablePlayers = PLAYERS_ARRAY.filter(player => !slottedPlayersIds.includes(player.id));  
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
  players.value = PLAYERS_ARRAY;
  team1.value = [];
  team2.value = [];
  likesTeams.value = undefined;
  id.value = 0; 
}

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

.teams
  display: flex
  flex-direction: column
  gap: 16px
  margin-bottom: 24px
  &__wrapper
    display: flex
    justify-content: center
    gap: 8px
  &__team
    padding: 8px
    border: 2px solid #ccc
    width: 200px
    display: flex
    flex-direction: column
    gap: 12px
  &__controls
    display: flex
    justify-content: center
    gap: 12px
  &__button
    padding: 10px 20px
    cursor: pointer

.team-box
  padding: 5px
  min-height: 200px
  background-color: #e8e8e8

.player
  padding: 8px 12px
  background: white
  border: 1px solid #ddd
  margin: 5px
  cursor: pointer

@media (prefers-color-scheme: dark)
  .player, .saved-teams__player
    background-color: #2d2d2d
    color: white
  .player-pool, .team-box, .saved-teams
    background-color: #545454
  .saved-teams__pair
    background-color: #242424
</style>
