// Shared by Home.vue and Admin.vue: hydrates each player with their elo/god data from the API.
export async function fetchPlayerElos(players) {
  await Promise.all(
    players.value.map(async player => {
      try {
        const { elos } = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/elos/${player.profile_id}`
        ).then(r => r.json())

        if (!elos) {
          console.warn(`${player.name} has no Elo data yet. Play some more games!`)
          return
        }

        const playerElo = {
          global: elos.find(e => e.god === '')?.elo,
          gods: elos.filter(e => e.god !== '').map((g) => ({ ...g, key: g.god })),
        }

        const topResult = playerElo.gods[0]

        if (topResult) {
          player.elo = Math.round(topResult.elo)
          player.god = topResult.god
          player.eloData = playerElo
        }
      } catch (err) {
        console.error(`Failed to fetch elo for ${player.profile_id}`, err)
      }
    })
  )
}
