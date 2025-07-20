import { ref } from 'vue'
import { PLAYERS_ARRAY } from '../data/players.js'

export function usePlayerData() {
  // Reactive data
  const playersMap = ref([])
  const players = ref([])
  const isLoadingWinRates = ref(false)

  // Initialize players with skill-based scoring only
  function initializePlayers() {
    const basePlayersData = PLAYERS_ARRAY.map(player => {
      const values = Object.values(player.scores);
      const skillAverage = values.reduce((a, b) => a + b, 0) / values.length;
      return {
        ...player,
        score: Math.round(skillAverage),
        win_rate: null // Initialize with null, will be fetched from aomstats
      }
    })
    
    playersMap.value = basePlayersData;
    players.value = [...basePlayersData];
  }

  // Fetch win rates from aomstats for all players
  async function fetchPlayerWinRates() {
    isLoadingWinRates.value = true;
    
    try {
      // Get all profile IDs
      const profileIds = PLAYERS_ARRAY.map(player => player.profileId).join(',');
      
      // Fetch win rates using the netlify function
      const response = await fetch(`/.netlify/functions/player-data?profileIds=${profileIds}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const winRateData = await response.json();
      
      // Update players with win rates (but keep original skill-based scores)
      const updatedPlayers = players.value.map(player => {
        const playerWinRateData = winRateData[player.profileId];
        const winRate = playerWinRateData?.winRate;
        
        return {
          ...player,
          win_rate: winRate
          // Note: Keeping original skill-based score, not updating it with win rate
        };
      });
      
      playersMap.value = updatedPlayers;
      players.value = [...updatedPlayers];
      
      console.log('Win rates fetched successfully:', winRateData);
    } catch (error) {
      console.error('Error fetching win rates:', error);
      console.log('Note: Win rates will be available when deployed to Netlify with the serverless function.');
    } finally {
      isLoadingWinRates.value = false;
    }
  }

  // Development function to test win rate integration with mock data
  function testWithMockWinRates() {
    isLoadingWinRates.value = true;
    
    // Mock win rate data for testing
    const mockWinRateData = {
      '1074827715': { winRate: 85 }, // Ayax
      '1074199836': { winRate: 92 }, // Diego
      '1073862520': { winRate: 78 }, // Piero
      '1074875183': { winRate: 45 }, // Jair
      '1074196830': { winRate: 88 }, // Jaume
      '1074910820': { winRate: 35 }, // Sebastian
      '1075027222': { winRate: 72 }, // Renato
      '1074849746': { winRate: 50 }, // Hector
      '1074203172': { winRate: 68 }, // Jardani
      '1074839111': { winRate: 25 }, // Christian
      '1075268390': { winRate: 30 }  // Almeida
    };
    
    // Update players with mock win rates (but keep original skill-based scores)
    const updatedPlayers = players.value.map(player => {
      const winRate = mockWinRateData[player.profileId]?.winRate;
      
      return {
        ...player,
        win_rate: winRate
        // Note: Keeping original skill-based score, not updating it with win rate
      };
    });
    
    playersMap.value = updatedPlayers;
    players.value = [...updatedPlayers];
    
    console.log('Mock win rates applied for development testing');
    isLoadingWinRates.value = false;
  }

  return {
    // Reactive data
    playersMap,
    players,
    isLoadingWinRates,
    
    // Functions
    initializePlayers,
    fetchPlayerWinRates,
    testWithMockWinRates // Development function for testing
  }
}
