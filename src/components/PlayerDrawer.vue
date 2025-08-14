<template>
  <n-drawer v-model:show="drawerActive" width="100%" placement="right">
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

      <template v-if="activePlayerGods?.length">
        <label>Filtrar desde: </label>
        <select v-model="activePlayerGodsFilter">
          <option value="2-week">2 semanas</option>
          <option value="1-month">1 mes</option>
          <option value="2-month">2 meses</option>
          <option value="6-month">6 meses</option>
          <option value="all">Todo</option>
        </select>
        <table class="player-gods">
          <thead>
            <tr>
              <th>Dios Mayor</th>
              <th>Partidas</th>
              <th>Winrate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in activePlayerGods">
              <td>
                <div class="player-gods__item">
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

      <Radar
        id="my-chart-id"
        :options="chartOptions"
        :data="activePlayerData"
      />
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
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
  playerDetailsActive: Object,
})

const emit = defineEmits(['update:active'])

const drawerActive = computed({
  get: () => props.active,
  set: (val) => emit('update:active', val)
})

const activePlayerGods = ref({});
const activePlayerGodsFilter = ref('all');
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
        data : [50, 50, 50, 50, 50, 50, 50, 50]
      },
    ],
  }
})

watch(activePlayerGodsFilter, async (newFilter) => {
  let value = 0;
  const todayCopy = new Date();

  switch (newFilter) {
    case '2-week':
      todayCopy.setDate(todayCopy.getDate() - 14);
      value = Math.round(todayCopy.getTime() / 1000);
      break;
    case '1-month':
      todayCopy.setMonth(todayCopy.getMonth() - 1);
      value = Math.round(todayCopy.getTime() / 1000);
      break;
    case '2-month':
      todayCopy.setMonth(todayCopy.getMonth() - 2);
      value = Math.round(todayCopy.getTime() / 1000);
      break;
  }

  const res = await fetch(`https://comix.fluffygangcomic.com/aomstats/gods/${props.playerDetailsActive.profile_id}?after=${value}`);
  const data  = await res.json();
  activePlayerGods.value = data.gods;
});

async function fetchGods(profileId) {
  if (!profileId) return;
  const res = await fetch(`https://comix.fluffygangcomic.com/aomstats/gods/${profileId}`);
  const data = await res.json();
  activePlayerGods.value = data.gods;
  activePlayerGodsFilter.value = '2-week';
}

function getGodIcon(name) {
  return new URL(`../assets/gods/${name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}_icon.avif`, import.meta.url).href;
}

function getPercentColor(number) {
  if (number > 50) return 'percent-green'
  else if (number > 45) return 'percent-yellow'
  else return 'percent-red'
}

onMounted(() => {
  fetchGods(props.playerDetailsActive.profile_id);
});

watch(
  () => props.playerDetailsActive.profile_id,
  (newId, oldId) => {
    if (newId && newId !== oldId) fetchGods(newId);
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

.player-gods
  width: 100%
  border-collapse: collapse
  td, th
    text-align: left
    padding: 8px
    border-bottom: 1px solid #948772
  &__item
    display: flex
    align-items: center
    gap: 8px
    text-transform: capitalize

.percent
  &-green
    color: #4ce171
  &-yellow
    color: #ffde7e
  &-red
    color: #f47a7a
</style>
