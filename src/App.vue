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
              @click="moveToAvailable(element.id)"/>
          </template>
        </draggable>
      </div>

      <div class="auto-balance">
        <h2 class="draggable-label">Jugadores disponibles</h2>
        <draggable v-model="autobalance" item-key="name" group="players" class="player-pool">
          <template #item="{ element, index }">
            <PlayerBadge :player="element" />
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
              <PlayerBadge :player="element" />
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
              <PlayerBadge :player="element" />
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { PLAYERS_ARRAY } from './data/players.js'
import draggable from "vuedraggable/dist/vuedraggable.common";
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
const autobalance = ref([])
const team1 = ref([])
const team2 = ref([])

// Computed properties for calculating team scores
const team1Score = computed(() => team1.value.reduce((sum, player) => sum + player.score, 0))
const team2Score = computed(() => team2.value.reduce((sum, player) => sum + player.score, 0))

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
        team1, team2,
        difference: Math.abs(score1 - score2),
        score1, score2
      })
    }
  }

  combinations.sort((a, b) => a.difference - b.difference);
  const top3 = combinations.slice(0, 3);
  const randomTeam = top3[Math.floor(Math.random() * top3.length)];

  team1.value = randomTeam.team1.sort((a, b) => b.score - a.score);
  team2.value = randomTeam.team2.sort((a, b) => b.score - a.score);
  autobalance.value = [];

}

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
</script>

<style lang="sass" scoped>

.team-builder
  padding: 8px
  width: 100%
  max-width: 640px
  margin: 0 auto
  @media (min-width: 768px)
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
  &:hover
    box-shadow: 0 0 5px rgba(241,194,50, 0.25) 
</style>
