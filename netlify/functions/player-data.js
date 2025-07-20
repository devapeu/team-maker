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
          // The aomstats API returns data in a specific indexed format:
          // nodes[1].data[1] contains field definitions
          // nodes[1].data[2+] contains the actual values in indexed format
          const nodes = data?.nodes;
          if (nodes && nodes.length > 1 && nodes[1]?.data && nodes[1].data.length > 1) {
            const playerData = nodes[1].data;
            let overallWinRate = null;
            
            // The template at index 1 shows the field mapping
            const template = playerData[1];
            if (template && template.win_rate !== undefined) {
              const winRateIndex = template.win_rate;
              
              // Check if we have data at the win_rate index
              if (playerData[winRateIndex] !== undefined) {
                const winRateValue = playerData[winRateIndex];
                if (typeof winRateValue === 'number') {
                  if (winRateValue >= 0 && winRateValue <= 1) {
                    // Decimal format (0.0 to 1.0)
                    overallWinRate = Math.round(winRateValue * 100);
                  } else if (winRateValue >= 0 && winRateValue <= 100) {
                    // Already in percentage format
                    overallWinRate = Math.round(winRateValue);
                  }
                }
              }
              
              // If no main win rate found or it's 0, calculate from wins/losses
              if (overallWinRate === null || overallWinRate === 0) {
                const winsIndex = template.wins;
                const lossesIndex = template.losses;
                
                if (winsIndex !== undefined && lossesIndex !== undefined) {
                  const wins = playerData[winsIndex];
                  const losses = playerData[lossesIndex];
                  
                  if (typeof wins === 'number' && typeof losses === 'number') {
                    const totalGames = wins + losses;
                    if (totalGames > 0) {
                      overallWinRate = Math.round((wins / totalGames) * 100);
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
