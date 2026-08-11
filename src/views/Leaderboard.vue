<template>
  <main class="stats">
    <h1>Posiciones</h1>
    <div class="stats-dashboard">
      <div class="stats-card">
        <h2>Elo Global</h2>
        <table v-if="globalLeaderboard.length" class="player-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              <th>Elo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in globalLeaderboard" :key="entry.profile_id">
              <td
                  class="leaderboard-rank">
                {{ index + 1 }}
              </td>
              <td>
                <div class="cell-wrapper player-table__item">
                  <img
                      v-if="entry.player?.god"
                      class="leaderboard-avatar"
                      :src="`/img/gods/${entry.player.god}_icon.avif`"/>
                  {{ entry.name }}
                </div>
              </td>
              <td>{{ eloWhole(entry.elo) }}<span class="leaderboard-elo-decimal">.{{ eloDecimal(entry.elo) }}</span></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No hay datos de elo global.</div>
      </div>

      <div class="stats-card">
        <h2>Elo por Dios Mayor</h2>
        <table v-if="godLeaderboard.length" class="player-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              <th>Dios</th>
              <th>Elo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in godLeaderboard" :key="`${entry.profile_id}-${entry.god}`">
              <td
                  class="leaderboard-rank"
                  :style="{ borderLeft: `4px solid ${entry.player?.color ?? 'transparent'}` }">
                {{ index + 1 }}
              </td>
              <td>
                {{ entry.name }}
              </td>
              <td>
                <div class="cell-wrapper player-table__item">
                  <img
                      class="leaderboard-avatar"
                      :src="`/img/gods/${entry.god}_icon.avif`"/>
                  {{ entry.god }}
                </div>
              </td>

              <td>{{ eloWhole(entry.elo) }}<span class="leaderboard-elo-decimal">.{{ eloDecimal(entry.elo) }}</span></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No hay datos de elo por dios mayor.</div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { PLAYERS_ARRAY } from '../data/players';

const PLAYERS_BY_ID = Object.fromEntries(PLAYERS_ARRAY.map(p => [p.profile_id, p]));

const globalLeaderboard = ref([]);
const godLeaderboard = ref([]);

function eloWhole(elo) {
  return elo.toFixed(1).split('.')[0];
}

function eloDecimal(elo) {
  return elo.toFixed(1).split('.')[1];
}

async function fetchLeaderboard(scope) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/leaderboard?scope=${scope}`);
    const data = await res.json();
    return (data.leaderboard ?? []).map(entry => ({
      ...entry,
      player: PLAYERS_BY_ID[entry.profile_id],
    }));
  } catch {
    return [];
  }
}

onMounted(async () => {
  globalLeaderboard.value = await fetchLeaderboard('global');
  godLeaderboard.value = await fetchLeaderboard('god');
});
</script>

<style lang="sass" scoped>
@use "../styles/abstracts/_variables" as *

.stats
  max-width: 1180px
  padding: 0 16px
  margin: auto

.stats-dashboard
  margin-top: 16px
  display: grid
  gap: 36px
  grid-template-columns: 1fr 1fr
  padding-bottom: 48px
  @media (max-width: 768px)
    gap: 24px
    grid-template-columns: 1fr

.stats-card
  h2
    margin-bottom: 8px

.empty-state
  margin-top: 10px
  padding: 20px
  color: $bronze-50
  text-align: center
  border: 1px solid $bronze-200

.leaderboard-avatar
  width: 28px
  height: 28px

.leaderboard-rank
  color: $bronze-100
  padding-left: 14px

.leaderboard-elo-decimal
  color: $bronze-100
</style>
