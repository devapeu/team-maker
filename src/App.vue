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
          <button @click="reset">Reestablecer todos</button>
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
        <h2 class="player-info__name">
        {{ playerDetailsActive.name }}
        </h2>
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
import { ref, computed } from 'vue'
import { PLAYERS_ARRAY } from './data/players.js'
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

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

// Handle player data and calculate overall player score
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
const autobalance = ref([])
const team1 = ref([])
const team2 = ref([])

// Calculate score for Team 1 and Team 2 
const team1Score = computed(() => team1.value.reduce((sum, player) => sum + player.score, 0))
const team2Score = computed(() => team2.value.reduce((sum, player) => sum + player.score, 0))

// Slideout & Player Profile Details
const active = ref(false)
const playerDetailsActive = ref(false)
const activePlayerData = computed(() => {
  const labels = Object.keys(playerDetailsActive.value.scores);
  const data = Object.values(playerDetailsActive.value.scores);
  return {
    labels: labels,
    datasets: [ 
      { 
        label: playerDetailsActive.value.name, 
        borderColor: 'orange',
        data : data 
      },
      { 
        label: "Promedio", 
        borderColor: "grey",
        data : [50, 50, 50, 50, 50, 50, 50, 50]
      },
    ],
  }
})

const openPlayerDetails = (id) => {
  playerDetailsActive.value = playersMap.find(player => player.id === id);
  active.value = true
}

// Autobalance method
function autoBalanceTeams() {
  const playerPool = [...team1.value, ...team2.value, ...autobalance.value];
  const scores = playerPool.map(player => player.score);

  const combinations = [];
  const total = scores.length;
  const max = Math.pow(2, total);

  for (let i = 1; i < max - 1; i++) {
  const team1 = [], team2 = [];
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
    const min1 = team1.map(p => p.name).sort()[0];
    const min2 = team2.map(p => p.name).sort()[0];

    if (min1 > min2) continue; // Skip duplicate mirror

    combinations.push({
      team1, team2,
      difference: Math.abs(score1 - score2),
      score1, score2
    });
  }
}


  combinations.sort((a, b) => a.difference - b.difference);
  console.log(combinations)
  const top = combinations.slice(0, 3);
  const randomTeam = top[Math.floor(Math.random() * top.length)];

  team1.value = randomTeam.team1.sort((a, b) => b.score - a.score);
  team2.value = randomTeam.team2.sort((a, b) => b.score - a.score);
  autobalance.value = [];

}

// Player manipluating functions
function reset() {
  players.value = playersMap;
  autobalance.value = [];
  team1.value = [];
  team2.value = [];
}

function resetAvailable() {
  autobalance.value = [...autobalance.value, ...team1.value, ...team2.value];
  team1.value = [];
  team2.value = [];
}

function moveToAvailable(id) {
  const player = players.value.find(player => player.id === id);
  if (player) {
    autobalance.value.push(player);
    players.value = players.value.filter(player => player.id !== id);
  }
}

function getGodIcon(name) {
  return new URL(`./assets/gods/${name}_icon.avif`, import.meta.url).href;
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
  button
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
  &__name
    margin-bottom: 0
</style>
