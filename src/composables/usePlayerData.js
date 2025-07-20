import { ref } from 'vue'
import { PLAYERS_ARRAY } from '../data/players.js'

export function usePlayerData() {
  // Reactive data
  const playersMap = ref([])
  const players = ref([])

  // Initialize players with skill-based scoring only
  function initializePlayers() {
    const basePlayersData = PLAYERS_ARRAY.map(player => {
      const values = Object.values(player.scores);
      const skillAverage = values.reduce((a, b) => a + b, 0) / values.length;
      return {
        ...player,
        score: Math.round(skillAverage), 
      }
    })
    
    playersMap.value = basePlayersData;
    players.value = [...basePlayersData];
  }

  return {
    // Reactive data
    playersMap,
    players,
    
    // Functions
    initializePlayers
  }
}
