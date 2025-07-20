exports.handler = async (event, context) => {
  const { profileId, profileIds } = event.queryStringParameters || {};
  
  // Handle single profile ID (for backward compatibility)
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
            // Find leaderboard data - typically the ranked 1v1 data (leaderboard_id: 1)
            let overallWinRate = null;
            
            // Check different leaderboard entries
            for (let i = 1; i < playerInfo.length; i++) {
              const entry = playerInfo[i];
              if (entry && typeof entry === 'object' && entry.win_rate !== undefined && entry.leaderboard_id === 1) {
                // Convert decimal to percentage and round to nearest integer
                overallWinRate = Math.round(entry.win_rate * 100);
                break;
              }
            }
            
            // Fallback: if no ranked 1v1 data found, look for any win rate
            if (overallWinRate === null) {
              for (let i = 1; i < playerInfo.length; i++) {
                const entry = playerInfo[i];
                if (entry && typeof entry === 'object' && entry.win_rate !== undefined) {
                  overallWinRate = Math.round(entry.win_rate * 100);
                  break;
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
