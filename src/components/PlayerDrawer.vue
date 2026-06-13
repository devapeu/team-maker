<template>
  <n-drawer 
    v-model:show="drawerActive"
    width="100%"
    placement="right"
    :auto-focus="false">
    <n-drawer-content>
      <div class="player-info">
        <img 
          class="player-info__image" 
          :src="`/img/gods/${playerDetailsActive.god}_icon.avif`"
          :style="{ borderColor: playerDetailsActive.color }"/>
        <h2 class="player-info__name">
        {{ playerDetailsActive.name }}
        </h2>
        <span 
          v-if="activePlayerWinstreak > 2"
          :class="[
            activePlayerWinstreak > 6 ? 'vibrate-200ms' : activePlayerWinstreak > 4 ? 'vibrate-500ms' : ''
          ]">
          🔥 {{ activePlayerWinstreak }}
        </span>
      </div>

      <button 
        key="close-btn"
        class="close-drawer" 
        @click="closeDrawer">
        &times;
      </button>

      <div class="player-controls">  
        <label>Filtrar desde: </label>
        <select v-model="timestampFilter">
          <option value="1-week">1 semana</option>
          <option value="2-week">2 semanas</option>
          <option value="1-month">1 mes</option>
          <option value="2-month">2 meses</option>
          <option value="6-month">6 meses</option>
          <option value="all">Todo</option>
        </select>
      </div>
      <template v-if="activePlayerGods?.length">
        <h2 class="player-section-title">Victorias</h2>
        <table class="player-table">
          <thead>
            <tr>
              <th>Dios Mayor</th>
              <th>Partidas</th>
              <th>Winrate</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="row in activePlayerGods"
              :key="row.name">
              <td>
                <div class="player-table__item">
                  <img 
                    width="32" 
                    :src="`/img/gods/${row.name}_icon.avif`" />
                  {{ row.name }}
                </div>
              </td>
              <td>{{ row.total_games }}</td>
              <td :class="getPercentColor(row.winrate_percent)">{{ row.winrate_percent.toFixed() }}%</td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-else>
        <div class="empty-state">
          No hay partidas en ese intervalo de tiempo.
        </div>
      </template>

      <template v-if="activePlayerPartners?.length">
          <h2 class="player-section-title">Mejores Compañeros</h2>
          <p class="player-section-subtitle">Porcentaje de victorias de {{ playerDetailsActive?.name }} al jugar con cada jugador.</p>
        <table class="player-table">
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Ganadas</th>
              <th>Total</th>
              <th>Winrate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in activePlayerPartners" :key="player[0]">
              <td>
                {{ getPlayerName(player[1].profile_id) }}
              </td>
              <td>
                {{ player[1].wins }}
              </td>
              <td>
                {{ player[1].total }}
              </td>
              <td :class="getPercentColor((player[1].wins / player[1].total) * 100)">
                {{ ((player[1].wins / player[1].total) * 100).toFixed() }}%
              </td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-else>
        <div class="empty-state">
          No se han encontrado compañeros de equipo para este jugador.
        </div>
      </template>

      <template v-if="activePlayerRivals?.length">
        <h2 class="player-section-title">Oponentes</h2>
        <p class="player-section-subtitle">Porcentaje de victorias contra {{ playerDetailsActive?.name }}.</p>
        <table class="player-table">
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Ganadas</th>
              <th>Total</th>
              <th>Winrate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in activePlayerRivals" :key="player[0]">
              <td>
                {{ getPlayerName(player[1].profile_id) }}
              </td>
              <td>
                {{ player[1].wins }}
              </td>
              <td>
                {{ player[1].total }}
              </td>
              <td :class="getPercentColor((player[1].wins / player[1].total) * 100)">
                {{ ((player[1].wins / player[1].total) * 100).toFixed() }}%
              </td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-else>
        <div class="empty-state">
          No se han encontrado compañeros de equipo para este jugador.
        </div>
      </template>
      <template v-if="activePlayerMaps?.length">
        <h2 class="player-section-title">Victorias por Mapa</h2>
        <table class="player-table">
          <thead>
          <tr>
            <th>Mapa</th>
            <th>Partidas</th>
            <th>Winrate</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="row in visibleMaps"
              :key="row.name">
            <td>{{ row.name }}</td>
            <td>{{ row.total_games }}</td>
            <td :class="getPercentColor(row.winrate_percent)">{{ row.winrate_percent.toFixed() }}%</td>
          </tr>
          </tbody>
        </table>
        <button
          v-if="activePlayerMaps.length > 10"
          class="toggle-maps-btn"
          @click="showAllMaps = !showAllMaps">
          {{ showAllMaps ? 'Ver menos' : `Ver ${activePlayerMaps.length - 10} más` }}
        </button>
      </template>
      <template v-else>
        <div class="empty-state">
          No hay datos de mapas en ese intervalo de tiempo.
        </div>
      </template>
      <h2 class="player-section-title">Historial</h2>
      <div class="chart">
        <Line
            :data="eloChartData"
            :options="eloChartOptions"/>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { PLAYERS_ARRAY } from '../data/players.js'
import { computed, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import { NDrawer, NDrawerContent } from "naive-ui"
import { eloChartOptions } from "@/data/chartOptions.js";
import { getGodColor } from "@/data/colors.js";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js"

import 'chartjs-adapter-date-fns'

ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    TimeScale,
    Tooltip,
    Legend,
    CategoryScale,
)

const props = defineProps({
  active: Boolean,
  averages: Array,
  playerDetailsActive: Object | Boolean,
})

const emit = defineEmits(['update:active'])

const drawerActive = computed({
  get: () => props.active,
  set: (val) => emit('update:active', val)
})

const activePlayerPartners = ref([]);
const activePlayerRivals = ref([]);
const activePlayerGods = ref({});
const activePlayerMaps = ref([]);
const showAllMaps = ref(false);
const visibleMaps = computed(() => showAllMaps.value ? activePlayerMaps.value : activePlayerMaps.value.slice(0, 10));
const activePlayerWinstreak = ref();
const activePlayerEloHistory = ref();

const timestampFilter = ref('2-week');
const timestampValue = computed(() => {
  const today = new Date();

  switch (timestampFilter.value) {
    case '1-week':
      today.setDate(today.getDate() - 7);
      return Math.round(today.getTime() / 1000);
    case '2-week':
      today.setDate(today.getDate() - 14);
      return Math.round(today.getTime() / 1000);
    case '1-month':
      today.setMonth(today.getMonth() - 1);
      return Math.round(today.getTime() / 1000);
    case '2-month':
      today.setMonth(today.getMonth() - 2);
      return Math.round(today.getTime() / 1000);
    case '6-month':
      today.setMonth(today.getMonth() - 6);
      return Math.round(today.getTime() / 1000);
    default:
      return 0;
  }
});

const eloChartData = computed(() => {
  return {
    datasets: activePlayerEloHistory.value ?? [],
  }
})

async function fetchGods(profileId, after = 0) {
  if (!profileId) return;
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gods/${profileId}?after=${after}`);
  const data = await res.json();
  activePlayerGods.value = data.gods;
}

async function fetchWinstreak(profileId) {
  if (!profileId) return;
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/winstreak/${profileId}`);
  const data = await res.json();
  activePlayerWinstreak.value = data.winstreak;
}

function sortPlayers(array) {
  return Object.entries(array)
    .sort((a, b) => {
      if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
      return b[1].total - a[1].total;
    });
}

async function fetchPartners(profileId, after = 0) {
  if (!profileId) return;
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/partners/${profileId}?after=${after}`);
  const data = await res.json();

  if (!data.players) {
    activePlayerPartners.value = [];
    return;
  }
  activePlayerPartners.value = sortPlayers(data.players);
}

async function fetchRivals(profileId, after = 0) {
  if (!profileId) return;
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/rivals/${profileId}?after=${after}`);
  const data = await res.json();

  if (!data.players) {
    activePlayerRivals.value = [];
    return;
  }

  activePlayerRivals.value = sortPlayers(data.players);
}

async function fetchMaps(profileId, after = 0) {
  if (!profileId) return;
  showAllMaps.value = false;
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/maps/${profileId}?after=${after}`);
  const data = await res.json();
  activePlayerMaps.value = data.maps ?? [];
}

async function fetchEloHistory(profileId, after = 0) {
  if (!profileId) return;
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/elo-history/${profileId}?after=${after}`);
  const data = await res.json();
  if (!data.rows) {
    activePlayerEloHistory.value = [];
    return
  }
  activePlayerEloHistory.value = Object.entries(data.rows).map(([label, data]) => {
    const color = getGodColor(label);
    return {
      label,
      data,
      stepped: true,
      borderColor: color?.border,
      backgroundColor: color?.background,
      pointBorderColor: color?.border,
      pointBackgroundColor: color?.background,
    }
  });
}

function getPercentColor(number) {
  if (number > 70) return 'percent-teal'
  else if (number > 50) return 'percent-green'
  else if (number > 45) return 'percent-yellow'
  else return 'percent-red'
}

function getPlayerName(id) {
  return PLAYERS_ARRAY.find(p => p.profile_id == id)?.name;
}

function closeDrawer() {
  drawerActive.value = false;
}

function fetchData() {
  fetchGods(props.playerDetailsActive.profile_id, timestampValue.value);
  fetchMaps(props.playerDetailsActive.profile_id, timestampValue.value);
  fetchPartners(props.playerDetailsActive.profile_id, timestampValue.value);
  fetchRivals(props.playerDetailsActive.profile_id, timestampValue.value);
  fetchWinstreak(props.playerDetailsActive.profile_id);
  fetchEloHistory(props.playerDetailsActive.profile_id, timestampValue.value);
}

watch(
  [() => props.playerDetailsActive.profile_id, timestampFilter],
  (newId, oldId) => {
    fetchData();
  }
);
</script>

<style scoped lang="sass">
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
    border-left-width: 8.5px
  &__name
    margin-bottom: 0

.empty-state
  margin-top: 10px
  padding: 20px
  color: #aaa
  text-align: center
  border: 1px solid #948772

.player-controls
  display: flex
  gap: 8px
  align-items: center
  justify-content: flex-end
  label
    font-weight: 500
    color: #bbb
  select
    padding: 2px 10px

.player-section-title
  margin-top: 20px
  margin-bottom: 0
  font-size: 18px

.toggle-maps-btn
  margin-top: 8px
  width: 100%
  padding: 6px
  background: none
  border: 1px solid #948772
  color: #bbb
  cursor: pointer
  &:hover
    border-color: #c4a96d
    color: #eee

.player-section-subtitle
  font-style: italic
  opacity: 0.75

.percent
  &-teal
    color: #31e1bb
  &-green
    color: #4ce171
  &-yellow
    color: #ffde7e
  &-red
    color: #f47a7a

.chart
  height: 450px
</style>
