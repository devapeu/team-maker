import { ref, computed, watch } from 'vue'
import { COLORS } from '../data/colors.js'

export function useTeams(autobalanceRef) {
  const team1 = ref([])
  const team2 = ref([])
  // Win probability percent for Team 1
  const teamWinPercent = ref(null)

  // Win Rate stuff
  const teamWinRate = ref(null)
  const team1Id = ref('')
  const team2Id = ref('')
  const winrateIsHovered = ref(false)

  // Local cache for team winrate
  const teamsCache = ref({})

  // Team names mapping
  const teamNames = {
    "1074199836,1074203172,1074849746": "Team Frontón",
    "1073862520,1074827715,1074839111": "Team 4to B",
    "1073862520,1074199836,1074827715": "The Big Three",
    "1074839111,1075027222": "Team Fastech",
    "1074196830,1074827715": "Team Implosión",
    "1073862520,1075027222": "Team Fimbulwinter",
    "1074203172,1074910820": "Team Rayo",
    "1074849746,1075027222": "Team C.A.F.E.",
    "1074203172,1074849746,1074910820": "Oops! All Zeus",
  }

  // Team Labels
  const team1Label = computed(() => {
    const teamId = team1.value.map(p => String(p.profile_id)).sort().join(",")
    return teamNames[teamId] ? teamNames[teamId] : "Equipo 1"
  })

  const team2Label = computed(() => {
    const teamId = team2.value.map(p => String(p.profile_id)).sort().join(",")
    return teamNames[teamId] ? teamNames[teamId] : "Equipo 2"
  })

  // Calculate score for Team 1 and Team 2
  const team1Score = computed(() => team1.value.reduce((sum, player) => sum + player.score, 0))
  const team2Score = computed(() => team2.value.reduce((sum, player) => sum + player.score, 0))

  function resetTeamIds() {
    team1Id.value = null
    team2Id.value = null
    teamWinRate.value = null
  }

  // Watch teams for winrate fetching
  watch([team1, team2], async ([newTeam1, newTeam2]) => {
    const t1 = newTeam1.map(p => String(p.profile_id)).sort()
    const t2 = newTeam2.map(p => String(p.profile_id)).sort()
    const sortedTeams = [t1, t2].sort((a, b) => a.join(',').localeCompare(b.join(',')))
    const teamId = sortedTeams.map(t => t.join(',')).join(' vs ')

    if (!teamId || teamId === ' vs ') {
      resetTeamIds()
      return
    }

    // Use cache if available
    if (teamsCache.value[teamId]) {
      const data = teamsCache.value[teamId]
      if (data.teams === null) {
        resetTeamIds()
        return
      }
      team1Id.value = t1
      team2Id.value = t2
      teamWinRate.value = data
      return
    }

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/teams/${teamId}`)
    const data = await res.json()
    teamsCache.value[teamId] = data

    if (data.teams === null) {
      resetTeamIds()
      return
    }

    team1Id.value = t1
    team2Id.value = t2
    teamWinRate.value = data
  })

  // Autobalance method
  async function autoBalanceTeams() {
    const playerPool = [...team1.value, ...team2.value, ...autobalanceRef.value]
    const scores = playerPool.map(player => player.score)

    const combinations = []
    const total = scores.length
    const max = Math.pow(2, total)

    for (let i = 1; i < max - 1; i++) {
      const t1 = [], t2 = []
      let score1 = 0, score2 = 0

      for (let j = 0; j < total; j++) {
        if ((i & (1 << j)) !== 0) {
          t1.push(playerPool[j])
          score1 += playerPool[j].score
        } else {
          t2.push(playerPool[j])
          score2 += playerPool[j].score
        }
      }

      if (Math.abs(t1.length - t2.length) <= 1) {
        const min1 = t1.map(p => p.name).sort()[0]
        const min2 = t2.map(p => p.name).sort()[0]

        if (min1 > min2) continue // Skip duplicate mirror

        combinations.push({
          team1: t1,
          team2: t2,
          difference: Math.abs(score1 - score2),
          score1,
          score2
        })
      }
    }

    combinations.sort((a, b) => a.difference - b.difference)
    const top = combinations.slice(0, 5)
    const randomTeam = top[Math.floor(Math.random() * top.length)]

    // Assign unique random colors from COLORS to players in the selected teams.
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }

    const totalPlayersSelected = randomTeam.team1.length + randomTeam.team2.length
    let colorPool = shuffle(COLORS.slice())
    while (colorPool.length < totalPlayersSelected) {
      colorPool = colorPool.concat(shuffle(COLORS.slice()))
    }

    // Assign colors sequentially from the pool so no two players share the same color
    let colorIndex = 0
    randomTeam.team1.forEach(p => { p.color = colorPool[colorIndex++] })
    randomTeam.team2.forEach(p => { p.color = colorPool[colorIndex++] })

    team1.value = randomTeam.team1.sort((a, b) => b.score - a.score)
    team2.value = randomTeam.team2.sort((a, b) => b.score - a.score)
    autobalanceRef.value = []

    // --- Fetch win probability for Team 1 ---
    teamWinPercent.value = null
    const ids1 = team1.value.map(p => p.profile_id)
    const ids2 = team2.value.map(p => p.profile_id)
    if (ids1.length && ids2.length) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/team-odds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ team1: ids1, team2: ids2 })
        })
        if (res.ok) {
          const data = await res.json()
          if (data && typeof data.percent === 'number') {
            teamWinPercent.value = data.percent
          }
        }
      } catch (e) {
        teamWinPercent.value = null
      }
    }
  }

  return {
    team1,
    team2,
    team1Label,
    team2Label,
    team1Score,
    team2Score,
    teamWinRate,
    team1Id,
    team2Id,
    winrateIsHovered,
    autoBalanceTeams,
    resetTeamIds,
    teamWinPercent
  }
}
