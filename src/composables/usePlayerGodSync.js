// Shared by Home.vue and Admin.vue: applies a god change to whichever ref currently holds the player.
export function syncGodChange(refs, data) {
  for (const ref of refs) {
    const player = ref.value.find(p => p.id === data.id)

    if (!player) continue

    const newGod = player.eloData.gods.find(
      g => g.key === data.god
    )

    if (newGod) {
      player.elo = Math.round(newGod.elo)
      player.god = newGod.god
    }

    break
  }
}
