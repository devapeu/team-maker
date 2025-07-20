// God icon utility
export function getGodIcon(name) {
  return new URL(`../assets/gods/${name}_icon.avif`, import.meta.url).href;
}

// Calculate player skill average
export function calculateSkillAverage(scores) {
  const values = Object.values(scores);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// Calculate combined score (skill + win rate)
export function calculateCombinedScore(skillAverage, winRate, skillWeight = 0.7) {
  return Math.round((skillAverage * skillWeight) + (winRate * (1 - skillWeight)));
}

// Find player by ID
export function findPlayerById(players, id) {
  return players.find(player => player.id === id);
}
