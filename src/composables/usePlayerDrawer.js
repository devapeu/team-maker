import { ref } from 'vue'

export function usePlayerDrawer(playersMap) {
  const active = ref(false)
  const playerDetailsActive = ref(false)

  const openPlayerDetails = async (id) => {
    playerDetailsActive.value = playersMap.find(player => player.id === id)
    active.value = true
  }

  return {
    active,
    playerDetailsActive,
    openPlayerDetails
  }
}
