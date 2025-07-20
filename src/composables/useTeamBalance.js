import { ref, computed } from 'vue'

export function useTeamBalance(playersMap) {
  // Teams for drag and drop
  const autobalance = ref([])
  const team1 = ref([])
  const team2 = ref([])

  // Calculate scores for teams
  const team1Score = computed(() => 
    team1.value.reduce((sum, player) => sum + player.score, 0)
  )
  const team2Score = computed(() => 
    team2.value.reduce((sum, player) => sum + player.score, 0)
  )

  // Auto balance algorithm
  function autoBalanceTeams() {
    const playerPool = [...team1.value, ...team2.value, ...autobalance.value];
    const scores = playerPool.map(player => player.score);

    const combinations = [];
    const total = scores.length;
    const max = Math.pow(2, total);

    for (let i = 1; i < max - 1; i++) {
      const team1Players = [], team2Players = [];
      let score1 = 0, score2 = 0;

      for (let j = 0; j < total; j++) {
        if ((i & (1 << j)) !== 0) {
          team1Players.push(playerPool[j]);
          score1 += playerPool[j].score;
        } else {
          team2Players.push(playerPool[j]);
          score2 += playerPool[j].score;
        }
      }

      if (Math.abs(team1Players.length - team2Players.length) <= 1) {
        const min1 = team1Players.map(p => p.name).sort()[0];
        const min2 = team2Players.map(p => p.name).sort()[0];

        if (min1 > min2) continue; // Skip duplicate mirror

        combinations.push({
          team1: team1Players,
          team2: team2Players,
          difference: Math.abs(score1 - score2),
          score1,
          score2
        });
      }
    }

    combinations.sort((a, b) => a.difference - b.difference);
    console.log(combinations);
    
    const top = combinations.slice(0, 3);
    const randomTeam = top[Math.floor(Math.random() * top.length)];

    team1.value = randomTeam.team1.sort((a, b) => b.score - a.score);
    team2.value = randomTeam.team2.sort((a, b) => b.score - a.score);
    autobalance.value = [];
  }

  // Reset all teams
  function reset(players) {
    players.value = [...playersMap.value];
    autobalance.value = [];
    team1.value = [];
    team2.value = [];
  }

  // Reset only available players
  function resetAvailable() {
    autobalance.value = [...autobalance.value, ...team1.value, ...team2.value];
    team1.value = [];
    team2.value = [];
  }

  // Move player to available pool
  function moveToAvailable(id, players) {
    const player = players.value.find(player => player.id === id);
    if (player) {
      autobalance.value.push(player);
      players.value = players.value.filter(player => player.id !== id);
    }
  }

  return {
    // Reactive data
    autobalance,
    team1,
    team2,
    team1Score,
    team2Score,
    
    // Functions
    autoBalanceTeams,
    reset,
    resetAvailable,
    moveToAvailable
  }
}
