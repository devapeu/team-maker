import { ref } from 'vue'
import { PLAYERS_ARRAY } from '../data/players.js'

export function usePlayerData() {
  // Reactive data
  const playersMap = ref([])
  const players = ref([])
  const apiData = ref(null)
  const winRateData = ref({})

  // Initialize players with API data
  async function initializePlayers() {
    // First create base player data with skill scores
    let basePlayersData = PLAYERS_ARRAY.map(player => {
      const values = Object.values(player.scores);
      const skillAverage = values.reduce((a, b) => a + b, 0) / values.length;
      return {
        ...player,
        skillAverage: Math.round(skillAverage),
        score: Math.round(skillAverage), // Initially use skill average
      }
    })
    
    playersMap.value = basePlayersData;
    players.value = [...basePlayersData];
    
    // Fetch win rates and recalculate scores
    await fetchAndCalculateScores();
  }

  async function fetchAndCalculateScores() {
    try {
      // Get all profile IDs that are not null
      const profileIds = playersMap.value
        .filter(player => player.profileId && player.profileId !== null)
        .map(player => player.profileId);
      
      if (profileIds.length === 0) {
        console.log('No profile IDs found to fetch win rates');
        return;
      }
      
      console.log('Fetching win rates for profile IDs:', profileIds);
      
      // Call our Netlify function with multiple profile IDs
      const url = `/.netlify/functions/player-data?profileIds=${profileIds.join(',')}`;
      console.log('Calling URL:', url);
      const response = await fetch(url);
      
      // Check if the response is OK
      if (!response.ok) {
        console.error(`HTTP Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return null;
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      // Get response text first to debug
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response was not valid JSON:', responseText);
        return null;
      }
      
      winRateData.value = data;
      console.log('Fetched win rate data:', data);
      
      // Update players with combined scores (skill + win rate)
      updatePlayersWithCombinedScores(data);
      
      return data;
    } catch (error) {
      console.error('Error fetching players win rates:', error);
      return null;
    }
  }

  function updatePlayersWithCombinedScores(winRateData) {
    // Update the players with combined scoring (skill average + win rate)
    playersMap.value = playersMap.value.map(player => {
      let updatedPlayer = { ...player };
      
      if (player.profileId && winRateData[player.profileId]) {
        const apiData = winRateData[player.profileId];
        if (apiData.success && apiData.winRate !== null) {
          console.log(`Updating ${player.name}: skill=${player.skillAverage}, API win rate=${apiData.winRate}%`);
          
          // Combined score: 70% skill average + 30% win rate
          const combinedScore = Math.round(
            (player.skillAverage * 0.7) + (apiData.winRate * 0.3)
          );
          
          updatedPlayer = {
            ...player,
            winrate: apiData.winRate,
            apiWinRate: apiData.winRate,
            score: combinedScore,
            winRateSource: 'api'
          };
          
          console.log(`${player.name} final score: ${combinedScore} (skill: ${player.skillAverage} + winrate: ${apiData.winRate})`);
        } else {
          console.warn(`Failed to get win rate for ${player.name} (${player.profileId}):`, apiData.error);
          updatedPlayer.winRateSource = 'manual';
        }
      } else {
        // No profile ID or API data - use manual win rate in combined score
        const combinedScore = Math.round(
          (player.skillAverage * 0.7) + (player.winrate * 0.3)
        );
        updatedPlayer.score = combinedScore;
        updatedPlayer.winRateSource = 'manual';
        
        console.log(`${player.name} (manual): final score: ${combinedScore} (skill: ${player.skillAverage} + manual winrate: ${player.winrate})`);
      }
      
      return updatedPlayer;
    });
    
    // Update the players ref to trigger reactivity
    players.value = [...playersMap.value];
  }

  // Legacy function for single profile fetching
  async function fetchPlayerData() {
    try {
      const response = await fetch('/api/profile/1073862520/__data.json');
      const data = await response.json();
      apiData.value = data;
      console.log('Fetched API Data:', data);
      console.log('Player Profile Data:', data.nodes?.[1]?.data?.[0]);
      return data;
    } catch (error) {
      console.error('Error fetching player data:', error);
      return null;
    }
  }

  // Helper function to test a profile ID
  async function testProfileId(profileId) {
    try {
      const response = await fetch(`/.netlify/functions/player-data?profileId=${profileId}`);
      const data = await response.json();
      console.log(`Profile ${profileId} data:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching profile ${profileId}:`, error);
      return null;
    }
  }

  return {
    // Reactive data
    playersMap,
    players,
    apiData,
    winRateData,
    
    // Functions
    initializePlayers,
    fetchAndCalculateScores,
    updatePlayersWithCombinedScores,
    fetchPlayerData,
    testProfileId
  }
}
