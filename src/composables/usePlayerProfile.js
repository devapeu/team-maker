import { ref, computed } from 'vue'

export function usePlayerProfile(playersMap) {
  const active = ref(false)
  const playerDetailsActive = ref(false)

  // Player profile data for chart
  const activePlayerData = computed(() => {
    if (!playerDetailsActive.value) return { labels: [], datasets: [] }
    
    const labels = Object.keys(playerDetailsActive.value.scores);
    const data = Object.values(playerDetailsActive.value.scores);
    
    return {
      labels: labels,
      datasets: [ 
        { 
          label: playerDetailsActive.value.name, 
          borderColor: 'orange',
          data: data 
        },
        { 
          label: "Promedio", 
          borderColor: "grey",
          data: [50, 50, 50, 50, 50, 50, 50, 50]
        },
      ],
    }
  })

  // Open player details sidebar
  function openPlayerDetails(id) {
    playerDetailsActive.value = playersMap.value.find(player => player.id === id);
    active.value = true
  }

  return {
    active,
    playerDetailsActive,
    activePlayerData,
    openPlayerDetails
  }
}
