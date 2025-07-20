/**
 * Netlify serverless function to fetch Age of Mythology player data from aomstats.io
 * 
 * Usage:
 * - Single player: ?profileId=1234567890
 * - Multiple players: ?profileIds=1234567890,0987654321,1122334455
 * 
 * Returns win rates from ranked 1v1 matches (leaderboard_id: 1)
 * with fallback to any available leaderboard data.
 */

exports.handler = async (event, context) => {
  const { profileId, profileIds } = event.queryStringParameters || {};
  
  // Handle single profile ID 
  if (profileId && !profileIds) {
    try {
      const response = await fetch(`https://aomstats.io/profile/${profileId}/__data.json?leaderboard=0`);
      const data = await response.json();
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
    } catch (error) {
      console.error('Error fetching player data:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch player data' })
      };
    }
  }

  // Handle multiple profile IDs for win rate extraction
  if (profileIds) {
    try {
      const ids = profileIds.split(',').filter(id => id.trim());
      const playerData = {};
      
      // Fetch data for all players
      const promises = ids.map(async (id) => {
        try {
          const response = await fetch(`https://aomstats.io/profile/${id}/__data.json?leaderboard=0`);
          const data = await response.json();
          
          // Extract overall win rate from the API data
          // Navigate through the nested structure to find leaderboard data
          const nodes = data?.nodes;
          if (nodes && nodes.length > 1 && nodes[1]?.data) {
            const playerInfo = nodes[1].data;
            let overallWinRate = null;
            
            // The data structure has field definitions at index 1 and values following
            // Look for leaderboard entries with leaderboard_id: 1 (ranked 1v1)
            for (let i = 1; i < playerInfo.length; i++) {
              const entry = playerInfo[i];
              if (entry && typeof entry === 'object' && entry.leaderboard_id === 1) {
                // Found ranked 1v1 data - extract win rate
                if (entry.win_rate !== undefined && typeof entry.win_rate === 'number') {
                  // win_rate is a decimal (0.0 to 1.0), convert to percentage
                  overallWinRate = Math.round(entry.win_rate * 100);
                } else if (entry.wins !== undefined && entry.losses !== undefined) {
                  // Calculate win rate from wins/losses
                  const totalGames = entry.wins + entry.losses;
                  if (totalGames > 0) {
                    overallWinRate = Math.round((entry.wins / totalGames) * 100);
                  }
                }
                break;
              }
            }
            
            // Fallback: if no ranked 1v1 data found, look for any leaderboard data
            if (overallWinRate === null) {
              for (let i = 1; i < playerInfo.length; i++) {
                const entry = playerInfo[i];
                if (entry && typeof entry === 'object') {
                  if (entry.win_rate !== undefined && typeof entry.win_rate === 'number' && entry.win_rate <= 1) {
                    overallWinRate = Math.round(entry.win_rate * 100);
                    break;
                  } else if (entry.wins !== undefined && entry.losses !== undefined) {
                    const totalGames = entry.wins + entry.losses;
                    if (totalGames > 0) {
                      overallWinRate = Math.round((entry.wins / totalGames) * 100);
                      break;
                    }
                  }
                }
              }
            }
            
            playerData[id] = {
              profileId: id,
              winRate: overallWinRate,
              success: true
            };
          } else {
            playerData[id] = {
              profileId: id,
              winRate: null,
              success: false,
              error: 'No player data found'
            };
          }
        } catch (error) {
          console.error(`Error fetching data for profile ${id}:`, error);
          playerData[id] = {
            profileId: id,
            winRate: null,
            success: false,
            error: error.message
          };
        }
      });
      
      await Promise.all(promises);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(playerData)
      };
    } catch (error) {
      console.error('Error processing multiple profiles:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to process player data' })
      };
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'Either profileId or profileIds parameter is required' })
  };
};
