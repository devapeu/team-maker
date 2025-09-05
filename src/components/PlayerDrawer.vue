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
          :src="getGodIcon(playerDetailsActive.main)"
          :style="{ borderColor: playerDetailsActive.color }"/>
        <h2 class="player-info__name">
        {{ playerDetailsActive.name }}
        </h2>
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
                  <img width="32" :src="getGodIcon(row.name)" />
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
                {{ getPlayerName(player[0]) }}
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

      <Radar
        id="my-chart-id"
        :options="chartOptions"
        :data="activePlayerData"
      />
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { PLAYERS_ARRAY } from '../data/players.js'
import { onMounted, computed, ref, watch } from 'vue'
import { Radar } from 'vue-chartjs'
import { chartOptions } from '../data/chartOptions.js'
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

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

const props = defineProps({
  active: Boolean,
  averages: Array,
  playerDetailsActive: Object,
})

const emit = defineEmits(['update:active'])

const drawerActive = computed({
  get: () => props.active,
  set: (val) => emit('update:active', val)
})

const activePlayerPartners = ref([]);
const activePlayerGods = ref({});
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
    default:
      return 0;
  }
});
const activePlayerData = computed(() => {
  const labels = Object.keys(props.playerDetailsActive.scores);
  const data = Object.values(props.playerDetailsActive.scores);
  return {
    labels: labels,
    datasets: [ 
      { 
        label: props.playerDetailsActive.name, 
        borderColor: 'orange',
        data : data 
      },
      { 
        label: "Promedio", 
        borderColor: "grey",
        data : props.averages
      },
    ],
  }
})

async function fetchGods(profileId, after = 0) {
  if (!profileId) return;
  const res = await fetch(`https://comix.fluffygangcomic.com/aomstats/gods/${profileId}?after=${after}`);
  const data = await res.json();
  activePlayerGods.value = data.gods;
}

async function fetchPartners(profileId, after = 0) {
  if (!profileId) return;
  const res = await fetch(`https://comix.fluffygangcomic.com/aomstats/partners/${profileId}?after=${after}`);
  const data = await res.json();

  if (!data.players) {
    activePlayerPartners.value = [];
    return;
  }
  // Sort by wins descending, then by total descending
  const sortedPlayers = Object.entries(data.players)
    .sort((a, b) => {
      if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
      return b[1].total - a[1].total;
    });
  activePlayerPartners.value = sortedPlayers;
}

function getGodIcon(name) {
  return new URL(`../assets/gods/${name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}_icon.avif`, import.meta.url).href;
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

onMounted(() => {
  fetchGods(props.playerDetailsActive.profile_id, timestampValue.value);
  fetchPartners(props.playerDetailsActive.profile_id, timestampValue.value);
});

watch(
  () => props.playerDetailsActive.profile_id,
  (newId, oldId) => {
    fetchGods(props.playerDetailsActive.profile_id, timestampValue.value);
    fetchPartners(props.playerDetailsActive.profile_id, timestampValue.value);
  }
);

watch(
  timestampFilter,
  (newFilter) => {
    fetchGods(props.playerDetailsActive.profile_id, timestampValue.value);
    fetchPartners(props.playerDetailsActive.profile_id, timestampValue.value);
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
    border-left-width: 4px
  &__name
    margin-bottom: 0

.empty-state
  margin-top: 10px
  padding: 20px
  color: #aaa
  text-align: center
  border: 1px solid #948772

.player-table
  width: 100%
  border-collapse: collapse
  th
    color: #aaa
    font-weight: normal
  td, th
    text-align: left
    padding: 8px
    border-bottom: 1px solid #948772
  &__item
    display: flex
    align-items: center
    gap: 8px
    text-transform: capitalize

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

.close-drawer
  position: absolute
  top: 20px
  right: 30px
  width: 32px
  height: 32px
  font-size: 24px
  background: none
  border: none
  color: #ccc
  font-weight: 100
  border-radius: 5px
  &:focus
    outline: none

.percent
  &-teal
    color: #31e1bb
  &-green
    color: #4ce171
  &-yellow
    color: #ffde7e
  &-red
    color: #f47a7a
</style>
