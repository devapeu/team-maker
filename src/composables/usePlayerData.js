import { ref } from 'vue'
import { PLAYERS_ARRAY } from '../data/players.js'

export function usePlayerData() {
  // Process players and calculate overall scores
  const playersMap = PLAYERS_ARRAY.map(player => {
    const values = Object.values(player.scores)
    const average = values.reduce((a, b) => a + b, 0) / values.length
    return {
      ...player,
      score: Math.round(average),
    }
  })

  // Calculate averages across all players
  const averages = (() => {
    const totals = {}
    let count = 0

    for (const player of PLAYERS_ARRAY) {
      for (const [key, value] of Object.entries(player.scores)) {
        totals[key] = (totals[key] || 0) + value
      }
      count++
    }

    const result = {}
    for (const [key, total] of Object.entries(totals)) {
      result[key] = Math.round(total / count)
    }

    return Object.values(result)
  })()

  const players = ref(playersMap)

  function reset(team1Ref, team2Ref) {
    players.value = [...playersMap]
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
    playersMap,
    averages,
    reset,
    moveToAvailable
  }
}
