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
            <h2 class="teams__name">{{ team1Label }}</h2>
            <div
              class="teams__header-side"
              @mouseenter="winrateIsHovered = true"
              @mouseleave="winrateIsHovered = false">
              <p
                v-if="teamWinRate !== null && !winrateIsHovered"
                class="teams__winrate">
                Wins: <span>{{ teamWinRate[team1Id] }}</span>
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
            <h2 class="teams__name">{{ team2Label }}</h2>
            <div
              class="teams__header-side"
              @mouseenter="winrateIsHovered = true"
              @mouseleave="winrateIsHovered = false">
              <p
                v-if="teamWinRate !== null && !winrateIsHovered"
                class="teams__winrate">
                Wins: <span>{{ teamWinRate[team2Id] }}</span>
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
import { ref, computed, watch } from 'vue'
import html2canvas from 'html2canvas'
import { PLAYERS_ARRAY } from './data/players.js'
import { COLORS } from './data/colors.js'
import draggable from "vuedraggable/dist/vuedraggable.common";
import PlayerBadge from './components/PlayerBadge.vue';
import PlayerDrawer from './components/PlayerDrawer.vue';

import ShuffleIcon from './components/ShuffleIcon.vue'
import DiscordIcon from './components/DiscordIcon.vue'
import MapSelector from './components/MapSelector.vue';

// Toasts (non-blocking notifications)
const toasts = ref([])
function showToast(message, type = 'info', duration = 5000) {
  const id = Date.now() + Math.random()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}

// Handle player data and calculate overall player score
const playersMap = PLAYERS_ARRAY.map(player => {
  const values = Object.values(player.scores);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    ...player,
    score: Math.round(average),
  }
})

const averages = (() => {
  const totals = {};
  let count = 0;

  for (const player of PLAYERS_ARRAY) {
    for (const [key, value] of Object.entries(player.scores)) {
      totals[key] = (totals[key] || 0) + value;
    }
    count++;
  }

  const result = {};
  for (const [key, total] of Object.entries(totals)) {
    result[key] = Math.round(total / count);
  }

  return Object.values(result);
})();

const players = ref(playersMap)

// Teams for the drag and drop functionality
const autobalance = ref([])
const team1 = ref([])
const team2 = ref([])

// Win Rate stuff
const teamWinRate = ref(null);
const team1Id = ref('');
const team2Id = ref('');
const winrateIsHovered = ref(false);

// Add local cache for team winrate
const teamsCache = ref({});

const teamNames = {
  "1074199836,1074203172,1074849746": "Team Frontón",
  "1073862520,1074827715,1074839111": "Team 4to B",
  "1073862520,1074199836,1074827715": "The Big Three",
  "1074839111,1075027222": "Team Fastech",
  "1074196830,1074827715": "Team Implosión",
  "1073862520,1075027222": "Team Fimbulwinter",
  "1074203172,1074910820": "Team Rayo",
  "1074849746,1075027222": "Team C.A.F.E.",
  "1074203172,1074849746,1074910820": "Oops! All Zeus",
}

// Team Labels
const team1Label = computed(() => {
  const teamId = team1.value.map(p => String(p.profile_id)).sort().join(",");
  return teamNames[teamId] ? teamNames[teamId] : "Equipo 1";
})
const team2Label = computed(() => {
  const teamId = team2.value.map(p => String(p.profile_id)).sort().join(",");
  return teamNames[teamId] ? teamNames[teamId] : "Equipo 2";
})

// Calculate score for Team 1 and Team 2 
const team1Score = computed(() => team1.value.reduce((sum, player) => sum + player.score, 0));
const team2Score = computed(() => team2.value.reduce((sum, player) => sum + player.score, 0));

const allPlayersPresent = computed(() => players.value.length === 0 && autobalance.value.length === 0);

// Slideout & Player Profile Details
const active = ref(false)
const playerDetailsActive = ref(false)

const openPlayerDetails = async (id) => {
  playerDetailsActive.value = playersMap.find(player => player.id === id);
  active.value = true
}

watch([team1, team2], async ([newTeam1, newTeam2]) => {
  const t1 = newTeam1.map(p => String(p.profile_id)).sort();
  const t2 = newTeam2.map(p => String(p.profile_id)).sort();
  const sortedTeams = [t1, t2].sort((a, b) => a.join(',').localeCompare(b.join(',')));
  const teamId = sortedTeams.map(t => t.join(',')).join(' vs ');

  if (!teamId || teamId === ' vs ') {
    resetTeamIds();
    return;
  }

  // Use cache if available
  if (teamsCache.value[teamId]) {
    const data = teamsCache.value[teamId];
    if (data.teams === null) {
      resetTeamIds();
      return;
    }
    team1Id.value = t1;
    team2Id.value = t2;
    teamWinRate.value = data;
    return;
  }

  const res = await fetch(`https://comix.fluffygangcomic.com/aomstats/teams/${teamId}`);
  const data = await res.json();
  teamsCache.value[teamId] = data;

  if (data.teams === null) {
    resetTeamIds();
    return;
  };

  team1Id.value = t1;
  team2Id.value = t2;
  teamWinRate.value = data;
})

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
  const top = combinations.slice(0, 5);
  const randomTeam = top[Math.floor(Math.random() * top.length)];

  // Assign unique random colors from COLORS to players in the selected teams.
  // Shuffle COLORS and assign without replacement to avoid repeats.
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  const totalPlayersSelected = randomTeam.team1.length + randomTeam.team2.length;
  let colorPool = shuffle(COLORS.slice());
  while (colorPool.length < totalPlayersSelected) {
    colorPool = colorPool.concat(shuffle(COLORS.slice()));
  }

  // Assign colors sequentially from the pool so no two players share the same color
  let colorIndex = 0;
  randomTeam.team1.forEach(p => { p.color = colorPool[colorIndex++]; });
  randomTeam.team2.forEach(p => { p.color = colorPool[colorIndex++]; });

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

function resetTeamIds() {
  team1Id.value = null;
  team2Id.value = null;
  teamWinRate.value = null;
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

// Capture the teams wrapper element and send it to Discord via webhook
async function sendPlannerToDiscord() {
  try {
    const el = document.querySelector('.teams__wrapper');
    if (!el) {
      showToast('No se encontró el elemento de equipos.', 'error', 3000);
      return;
    }

    if (team1.value.length === 0 || team2.value.length === 0) {
      showToast('Pon al menos un jugador en cada equipo.', 'error', 3000);
      return;
    }

    // Increase scale for acceptable resolution (but watch file size)
    const canvas = await html2canvas(el, { backgroundColor: '#0f0f0f', scale: 2 });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('No se pudo generar la imagen');

    const form = new FormData();
    form.append('file', blob, 'teams.png');
    form.append('content', 'Distribución de equipos');

    const webhookUrl = 'https://discord.com/api/webhooks/1442274909819633704/6a830IBy5CyuqOfP859belG5habkJDHMP8tCd8MkTH9aZKRg_D_3coGI8W8jyV0l80kk';

    const res = await fetch(webhookUrl, { method: 'POST', body: form });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Discord webhook failed: ${res.status} ${txt}`);
    }

    showToast('Enviado a Discord correctamente.', 'success', 3000);
  } catch (err) {
    console.error(err);
    showToast('Error al enviar a Discord: ' + (err.message || err), 'error', 4000);
  }
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
</style>
