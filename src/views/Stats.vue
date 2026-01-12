<template>
  <main class="stats">
    <h1>Stats</h1>
    <div class="stats-dashboard">
      <div>
        <h2>Mapas más jugados</h2>
        <table class="player-table">
          <thead>
            <tr>
              <th>Mapa</th>
              <th>Partidas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="map in maps">
              <td>
                <div class="cell-wrapper">
                  <img
                    :src="`/img/maps/${map.mapname}.webp`"
                    style="width: 50px"/>
                  {{ map.mapname }}
                </div>
              </td>
              <td>{{ map.count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <h2>Elo</h2>
        <table class="player-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Elo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in elo">
              <td>{{ player.name }}</td>
              <td>{{ player.elo }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'; 
import { PLAYERS_ARRAY } from '../data/players';

const maps = ref([]);
const elo = ref([]);

onMounted(async () => {
  const PLAYERS_BY_ID = Object.fromEntries(PLAYERS_ARRAY.map(p => [p.profile_id, p]));
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stats`);
    if (res) {
      const data = await res.json();
      maps.value = data.maps;

      const playersElo = data.elo.map(row => ({
        elo: row.elo,
        name: PLAYERS_BY_ID[row.profile_id]?.name,
      }));

      elo.value = playersElo;

      const matchupsList = data.matchups.map(row => ({
        team_match_id: row.team_match_id,
        count: row.count,
        team1: row.team1.map(p => PLAYERS_BY_ID[p]?.name),
        team2: row.team2.map(p => PLAYERS_BY_ID[p]?.name)
      }))

      console.log(matchupsList);
    }
  } catch {

  }
})
</script>

<style lang="sass" scoped>
.stats
  max-width: 1180px
  padding: 0 16px
  margin: auto
.stats-dashboard
  margin-top: 16px
  display: grid
  gap: 48px
  grid-template-columns: 3fr 1fr
  padding-bottom: 48px
  @media (max-width: 768px)
    gap: 24px
    grid-template-columns: 1fr
</style>