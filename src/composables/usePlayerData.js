import { ref } from 'vue'
import { PLAYERS_ARRAY } from '../data/players.js'

export function usePlayerData() {
  const players = ref([...PLAYERS_ARRAY])

  function reset(team1Ref, team2Ref) {
    players.value = [...PLAYERS_ARRAY]
    team1Ref.value = []
    team2Ref.value = []
  }

  function moveToAvailable(id, team1Ref, team2Ref) {
    const player = players.value.find(player => player.id === id)
    if (player) {
      if (team1Ref.value.length > team2Ref.value.length) {
        team2Ref.value.push(player)
      } else {
        team1Ref.value.push(player)
      }
      players.value = players.value.filter(player => player.id !== id)
    }
  }

  return {
    players,
    reset,
    moveToAvailable
  }
}
